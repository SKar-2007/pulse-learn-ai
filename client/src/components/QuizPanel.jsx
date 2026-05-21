export default function QuizPanel({ node, answer, setAnswer, onSubmit, feedback, loading }) {
  if (!node) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
        <p className="text-slate-400">No active node available for quiz review.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
      <h3 className="text-xl font-semibold text-slate-100">Quiz: {node.title}</h3>
      <p className="mt-2 text-slate-400">{node.summary}</p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your answer here..."
        className="mt-4 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
        rows="6"
      />

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={onSubmit}
          disabled={loading || answer.trim().length === 0}
          className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? 'Checking…' : 'Submit answer'}
        </button>
        {feedback ? <span className="text-sm text-slate-300">{feedback}</span> : null}
      </div>
    </div>
  );
}
