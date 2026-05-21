export default function SearchResults({ results, onNavigate, selectedIndex, setSelectedIndex }) {
  const sections = [
    { label: 'Pages', items: results.pages || [], type: 'page' },
    { label: 'Nodes', items: results.nodes || [], type: 'node' },
    { label: 'Notes & Blocks', items: results.notes || [], type: 'note' },
  ];

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.label}>
          <h3 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">{section.label}</h3>
          {section.items.length === 0 ? (
            <p className="text-sm text-white/40">No results</p>
          ) : (
            <div className="space-y-2">
              {section.items.map((item, index) => (
                <button
                  key={item.id || `${section.type}-${index}`}
                  onClick={() => onNavigate(item, section.type)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selectedIndex === index ? 'border-white/10 bg-black/90' : 'border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-white">{item.title || item.content || item.name}</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{section.label}</span>
                  </div>
                  {section.type === 'note' && item.page_title && (
                    <p className="text-[10px] text-white/40 mt-1">Page: {item.page_title}</p>
                  )}
                  {item.summary && <p className="text-xs text-white/40 mt-1 line-clamp-2">{item.summary}</p>}
                  {section.type === 'note' && item.content && (
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{item.content}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
