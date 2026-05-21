export default function StellarModal({ txHash }) {
  if (!txHash) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-20 mx-auto max-w-3xl px-4 sm:px-6">
      <div className="app-card border border-indigo-500/20 bg-slate-900/95">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-indigo-300">Credential anchored</h2>
            <p className="mt-1 text-sm text-slate-400">Your roadmap receipt has been anchored to Stellar testnet.</p>
          </div>
        </div>
        <pre className="mt-4 break-all rounded-3xl bg-slate-950 p-4 text-sm text-slate-200">{txHash}</pre>
      </div>
    </div>
  );
}
