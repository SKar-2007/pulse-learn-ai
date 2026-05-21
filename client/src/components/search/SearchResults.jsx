export default function SearchResults({ results, onNavigate, selectedIndex, setSelectedIndex }) {
  const sections = [
    { label: 'Pages', items: results.pages || [], type: 'page' },
    { label: 'Nodes', items: results.nodes || [], type: 'node' },
    { label: 'Notes', items: results.notes || [], type: 'note' },
  ];

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.label}>
          <h3 className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">{section.label}</h3>
          {section.items.length === 0 ? (
            <p className="text-sm text-slate-500">No results</p>
          ) : (
            <div className="space-y-2">
              {section.items.map((item, index) => (
                <button
                  key={item.id || `${section.type}-${index}`}
                  onClick={() => onNavigate(item)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selectedIndex === index ? 'border-indigo-500 bg-slate-900' : 'border-slate-800 hover:border-slate-600'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-white">{item.title || item.content || item.name}</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{section.label}</span>
                  </div>
                  {item.summary && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.summary}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
