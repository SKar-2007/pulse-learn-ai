export default function NodeCard({ title, summary, status }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:border-indigo-500">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{status}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{summary}</p>
    </div>
  );
}
