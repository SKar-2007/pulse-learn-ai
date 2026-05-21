export default function PageBreadcrumb({ pagePath = [], onNavigate }) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-[0.25em]">
      {pagePath.map((page, index) => (
        <button
          key={page.id}
          onClick={() => onNavigate(page.id)}
          className="hover:text-white transition-colors"
        >
          {page.title || 'Untitled'}{index < pagePath.length - 1 ? ' /' : ''}
        </button>
      ))}
    </div>
  );
}
