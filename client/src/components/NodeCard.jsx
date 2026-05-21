export default function NodeCard({ title, summary, status }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-xl shadow-slate-950/20">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-indigo-300">{title}</h3>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{status}</span>
      </div>
      <p className="mt-3 text-slate-400">{summary}</p>
    </div>
  );
}
