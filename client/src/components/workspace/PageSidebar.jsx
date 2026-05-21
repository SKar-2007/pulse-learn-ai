export default function PageSidebar({ pages, currentPageId, onPageSelect, onNewPage, onNewSubpage, onRenamePage, onDeletePage, onSaveAsTemplate }) {
  const renderPage = (page, depth = 0) => (
    <div key={page.id} className="space-y-1">
      <div
        onClick={() => onPageSelect(page.id)}
        className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-sm transition cursor-pointer ${currentPageId === page.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'}`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <span>{page.icon || '📄'}</span>
        <span className="truncate">{page.title || 'Untitled Page'}</span>
        <span className="text-xs text-slate-500">{page.children?.length ? page.children.length : ''}</span>
      </div>
      {page.children?.map((child) => renderPage(child, depth + 1))}
    </div>
  );

  const buildPageTree = (pageList) => {
    const map = {};
    pageList?.forEach((page) => { map[page.id] = { ...page, children: [] }; });
    const roots = [];
    pageList?.forEach((page) => {
      if (page.parent_page_id && map[page.parent_page_id]) {
        map[page.parent_page_id].children.push(map[page.id]);
      } else {
        roots.push(map[page.id]);
      }
    });
    return roots;
  };

  const tree = buildPageTree(pages || []);

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pages</p>
          <h2 className="text-sm font-semibold text-white">Workspace hierarchy</h2>
        </div>
        <button onClick={() => onNewPage()} className="text-indigo-400 text-xs">+ New</button>
      </div>
      <div className="space-y-2">{tree.map((page) => renderPage(page))}</div>
      <button onClick={onNewSubpage} className="mt-auto rounded-2xl border border-slate-800 px-4 py-3 text-sm text-slate-200 hover:border-indigo-500 hover:text-white transition">New subpage</button>
    </aside>
  );
}
