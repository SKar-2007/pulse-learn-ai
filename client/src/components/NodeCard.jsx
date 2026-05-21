export default function NodeCard({ title, summary }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-xl shadow-slate-950/20">
      <h3 className="text-lg font-semibold text-indigo-300">{title}</h3>
      <p className="mt-2 text-slate-400">{summary}</p>
    </div>
  );
}
