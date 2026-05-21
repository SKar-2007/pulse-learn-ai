export default function SkillTree({ nodes, selectedNodeId }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <h3 className="text-lg font-semibold text-slate-100">Skill tree overview</h3>
      <div className="mt-4 space-y-3">
        {nodes.length === 0 ? (
          <p className="text-slate-400">No nodes available yet.</p>
        ) : (
          nodes.map((node) => (
            <div
              key={node.id}
              className={`rounded-3xl border px-4 py-3 transition ${selectedNodeId === node.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950/80'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-100">{node.title}</p>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{node.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{node.summary.slice(0, 80)}{node.summary.length > 80 ? '...' : ''}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
