import { useState } from 'react';

const MCP_SERVICES = [
  { id: 'google_calendar', name: 'Google Calendar', emoji: '📅', color: '#4285F4' },
  { id: 'github', name: 'GitHub', emoji: '🐙', color: '#24292E' },
  { id: 'slack', name: 'Slack', emoji: '💬', color: '#4A154B' },
  { id: 'notion', name: 'Notion', emoji: '📝', color: '#000000' },
  { id: 'figma', name: 'Figma', emoji: '🎨', color: '#F24E1E' },
];

export default function MCPConnectionPanel({ connections = [], onConnect, onDisconnect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-200 space-y-4">
      <h3 className="text-sm font-semibold text-white">MCP Connections</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {MCP_SERVICES.map((service) => {
          const existing = connections.find((conn) => conn.service === service.id);
          return (
            <div key={service.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span style={{ backgroundColor: service.color }} className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-white">{service.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{service.name}</p>
                    <p className="text-xs text-slate-500">{existing ? 'Connected' : 'Not connected'}</p>
                  </div>
                </div>
                <button
                  onClick={() => (existing ? onDisconnect?.(existing) : onConnect?.(service))}
                  className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${existing ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                >
                  {existing ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
