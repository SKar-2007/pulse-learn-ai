import { useState } from 'react';
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from '../../lib/automationTriggers';

export default function AutomationRuleBuilder({ connections = [], onCreate }) {
  const [triggerType, setTriggerType] = useState('node_completed');
  const [actionType, setActionType] = useState('post_slack');
  const [config, setConfig] = useState({});

  const trigger = AUTOMATION_TRIGGERS[triggerType];
  const action = AUTOMATION_ACTIONS[actionType];

  const handleCreate = () => {
    onCreate?.({ trigger_type: triggerType, action_type: actionType, action_config: config });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/90 p-5 text-white space-y-4">
      <h3 className="text-sm font-semibold text-white">Automation Rule Builder</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-xs text-white/40">
          Trigger
          <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)} className="w-full rounded-2xl bg-black/90 border border-white/10 px-3 py-2 text-sm text-white outline-none">
            {Object.entries(AUTOMATION_TRIGGERS).map(([key, value]) => (
              <option value={key} key={key}>{value.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-xs text-white/40">
          Action
          <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="w-full rounded-2xl bg-black/90 border border-white/10 px-3 py-2 text-sm text-white outline-none">
            {Object.entries(AUTOMATION_ACTIONS).map(([key, value]) => (
              <option value={key} key={key}>{value.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="space-y-3">
        {action?.configFields?.map((field) => (
          <label key={field.name} className="space-y-2 text-xs text-white/40 block">
            {field.label}
            {field.type === 'textarea' ? (
              <textarea
                value={config[field.name] || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, [field.name]: e.target.value }))}
                className="w-full rounded-2xl bg-black/90 border border-white/10 px-3 py-3 text-sm text-white outline-none"
              />
            ) : (
              <input
                value={config[field.name] || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, [field.name]: e.target.value }))}
                type={field.type === 'number' ? 'number' : 'text'}
                className="w-full rounded-2xl bg-black/90 border border-white/10 px-3 py-2 text-sm text-white outline-none"
              />
            )}
          </label>
        ))}
      </div>
      <button onClick={handleCreate} className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white hover:bg-white/10 transition">
        Save rule
      </button>
    </div>
  );
}
