export default function StellarModal({ txHash }) {
  if (!txHash) return null;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
      <h2 className="text-xl font-semibold text-indigo-300">Credential Anchored</h2>
      <p className="mt-3 text-slate-400">Stellar TX hash:</p>
      <pre className="mt-2 break-all rounded-2xl bg-slate-900 p-4 text-sm text-slate-200">{txHash}</pre>
    </div>
  );
}
