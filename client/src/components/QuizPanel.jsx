export default function QuizPanel({ node, answer, setAnswer, onSubmit, feedback, loading }) {
  if (!node) {
    return (
      <div className="app-card">
        <p className="text-slate-400">No active node available for quiz review.</p>
      </div>
    );
  }

  return (
    <div className="app-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-100">Quiz: {node.title}</h3>
          <p className="mt-2 text-slate-400">{node.summary}</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">Practice</span>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your answer here..."
        className="textarea-base mt-4"
        rows="6"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={onSubmit} disabled={loading || answer.trim().length === 0} className="btn-primary">
          {loading ? 'Checking…' : 'Submit answer'}
        </button>
        {feedback ? <span className="text-sm text-slate-300">{feedback}</span> : null}
      </div>
    </div>
  );
}
