export default function PageSidebar({ pages, currentPageId, onPageSelect, onNewPage, onNewSubpage, onRenamePage, onDeletePage, onSaveAsTemplate, onDuplicatePage }) {
  const renderPage = (page, depth = 0) => (
    <div key={page.id} className="space-y-1">
      <div
        onClick={() => onPageSelect(page.id)}
        className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-sm transition cursor-pointer border border-white/5 ${currentPageId === page.id ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <span>{page.icon || '📄'}</span>
        <span className="truncate">{page.title || 'Untitled Page'}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRenamePage(page); }}
            className="text-xs text-white/40 hover:text-white"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDeletePage(page); }}
            className="text-xs text-white/50 hover:text-white"
          >
            🗑
          </button>
        </div>
      </div>
      {page.children?.map((child) => renderPage(child, depth + 1))}
    </div>
  );

  const buildPageTree = (pageList) => {
    const map = {};
    const pagesCopy = (pageList || []).map((page) => ({ ...page, children: [] }));
    pagesCopy.forEach((page) => { map[page.id] = page; });
    const roots = [];
    pagesCopy.forEach((page) => {
      if (page.parent_page_id && map[page.parent_page_id]) {
        map[page.parent_page_id].children.push(page);
      } else {
        roots.push(page);
      }
    });
    const sortTree = (nodes) => {
      nodes.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));
      nodes.forEach((node) => sortTree(node.children));
    };
    sortTree(roots);
    return roots;
  };

  const tree = buildPageTree(pages || []);

  return (
    <aside className="w-72 panel-simple overflow-y-auto">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">Pages</p>
          <h2 className="text-sm font-semibold text-white">Workspace hierarchy</h2>
        </div>
        <button onClick={() => onNewPage()} className="text-sm text-white/80 hover:text-white">+ New</button>
      </div>
      <div className="space-y-2">{tree.map((page) => renderPage(page))}</div>
      <div className="mt-4 space-y-2">
        <button onClick={onDuplicatePage} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">Duplicate current page</button>
        <button onClick={onSaveAsTemplate} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">Save page as template</button>
      </div>
      <button onClick={onNewSubpage} className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">New subpage</button>
    </aside>
  );
}
