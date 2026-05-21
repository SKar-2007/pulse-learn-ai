export default function LoopComponentViewer({ component, onEmbed }) {
  return (
    <div className="h-full w-full p-4 rounded-3xl border border-slate-800 bg-slate-950/80 text-slate-200">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Loop Component</h3>
          <p className="text-xs text-slate-500">Shared block content is synced across pages.</p>
        </div>
        <button
          onClick={() => onEmbed?.(component)}
          className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-indigo-500 transition"
        >
          Embed
        </button>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-slate-300">
        <p className="text-sm font-semibold text-white">{component?.title || 'Shared component'}</p>
        <pre className="mt-3 overflow-x-auto text-xs text-slate-400 bg-slate-950 p-3 rounded-2xl">{JSON.stringify(component?.block_config || {}, null, 2)}</pre>
      </div>
    </div>
  );
}
