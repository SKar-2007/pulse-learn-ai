export default function LoopComponentViewer({ config = {}, onEmbed }) {
  const component = config.component || config;

  return (
    <div className="h-full w-full p-4 rounded-3xl border border-white/10 bg-black/90 text-white">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Loop Component</h3>
          <p className="text-xs text-white/60">Shared block content is synced across pages.</p>
        </div>
        <button
          onClick={() => onEmbed?.(component)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white/10 transition"
        >
          Embed
        </button>
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/90 p-4 text-white/80">
        <p className="text-sm font-semibold text-white">{component?.title || 'Shared component'}</p>
        <pre className="mt-3 overflow-x-auto text-xs text-white/60 bg-black/95 p-3 rounded-2xl">{JSON.stringify(component?.block_config || component, null, 2)}</pre>
      </div>
    </div>
  );
}
