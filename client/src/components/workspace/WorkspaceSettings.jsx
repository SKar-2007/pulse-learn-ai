import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from '../../lib/automationTriggers';
import AutomationRuleBuilder from '../automation/AutomationRuleBuilder';
import MCPConnectionPanel from '../automation/MCPConnectionPanel';

export default function WorkspaceSettings({ roadmap, connections = [], automationRules = [], onConnect, onDisconnect, onCreateRule, onDeleteRule }) {
  return (
    <aside className="hidden xl:flex xl:w-[320px] flex-col gap-4 border-l border-white/10 bg-black/95 p-5 text-white">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Workspace Settings</p>
        <h2 className="text-lg font-semibold text-white">Integrations & Automations</h2>
      </div>
      <MCPConnectionPanel connections={connections} onConnect={onConnect} onDisconnect={onDisconnect} />
      <div className="rounded-3xl border border-white/10 bg-black/90 p-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">Automation rules</p>
          <p className="text-sm text-white/60">Create if/then workflows that trigger external actions.</p>
        </div>
        <AutomationRuleBuilder connections={connections} onCreate={onCreateRule} />
        <div className="rounded-3xl border border-white/10 bg-black/95 p-4">
          <h3 className="text-xs uppercase tracking-[0.25em] text-white/40 mb-3">Saved automation rules</h3>
          {automationRules.length === 0 ? (
            <p className="text-xs text-white/40">No rules configured yet. Save one above to start automating node and roadmap events.</p>
          ) : (
            <div className="space-y-3">
              {automationRules.map((rule) => (
                <div key={rule.id} className="rounded-2xl border border-white/10 bg-black/90 p-3 text-xs text-white/70">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{AUTOMATION_TRIGGERS[rule.trigger_type]?.label || rule.trigger_type}</p>
                      <p className="text-white/50">{AUTOMATION_ACTIONS[rule.action_type]?.label || rule.action_type}</p>
                    </div>
                    <button
                      onClick={() => onDeleteRule?.(rule.id)}
                      className="text-white/70 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                  {rule.action_config && (
                    <p className="mt-2 text-white/50 truncate">{JSON.stringify(rule.action_config)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/90 p-4 text-xs text-white/50">
        <p>Connected: {connections.length}</p>
        <p>Active rules: {automationRules.length}</p>
      </div>
    </aside>
  );
}
