export default function AIAssistantSidebar({ isOpen, onClose, pageContext, session, profile }) {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[370px] bg-slate-950 border-l border-slate-800 p-5 overflow-y-auto shadow-2xl z-40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">AI Assistant</p>
          <h2 className="text-lg font-semibold text-white">Workspace coach</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-slate-300 text-sm">
        <p>Ask the assistant about the current page, generate notes, or summarize progress for your learning path.</p>
        <p className="mt-3 text-xs text-slate-500">Current MBTI: {profile?.mbti_type || 'unknown'}</p>
      </div>
    </div>
  );
}
