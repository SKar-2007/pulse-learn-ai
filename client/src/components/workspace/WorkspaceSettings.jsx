export default function WorkspaceSettings({ roadmap, connections = [], automationRules = [] }) {
  return (
    <aside className="hidden xl:flex xl:w-[320px] flex-col gap-4 border-l border-slate-800 bg-slate-950 p-5 text-slate-200">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workspace Settings</p>
        <h2 className="text-lg font-semibold text-white">Integrations & Automations</h2>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">MCP connections</p>
        <p className="text-sm text-slate-400">Configure external tools and automation rules for this workspace.</p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Automation rules</p>
        <p className="text-sm text-slate-400">Create if/then workflows to connect nodes, Slack, GitHub, and calendar triggers.</p>
      </div>
    </aside>
  );
}
