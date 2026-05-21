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
    <div className="rounded-3xl border border-white/10 bg-black/90 p-5 text-white space-y-4">
      <h3 className="text-sm font-semibold text-white">MCP Connections</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {MCP_SERVICES.map((service) => {
          const existing = connections.find((conn) => conn.service === service.id);
          return (
            <div key={service.id} className="rounded-3xl border border-white/10 bg-black/95 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 text-white">{service.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{service.name}</p>
                    <p className="text-xs text-white/40">{existing ? 'Connected' : 'Not connected'}</p>
                  </div>
                </div>
                <button
                  onClick={() => (existing ? onDisconnect?.(existing) : onConnect?.(service))}
                  className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${existing ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-white/10 text-white hover:bg-white/20'}`}
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
