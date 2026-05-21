import { useMemo } from 'react';
import { CheckSquare, Loader2 } from 'lucide-react';
import useQuiz from '../../../hooks/useQuiz';

export default function QuizBlock({ roadmap, session, config, onConfigChange, workspaceNotes }) {
    const activeNode = useMemo(() => {
        return roadmap?.nodes?.find((node) => node.status === 'unlocked') || roadmap?.nodes?.[0];
    }, [roadmap]);

    const { answer, setAnswer, feedback, loading, submitAnswer } = useQuiz();

    if (!roadmap || !activeNode) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-gray-900 rounded-3xl border border-gray-800">
                <p className="text-sm text-gray-400">Select a roadmap to activate the quiz widget.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex items-center gap-2 mb-6 drag-handle cursor-grab active:cursor-grabbing text-indigo-400">
                <CheckSquare size={18} />
                <h3 className="font-bold text-white text-sm uppercase tracking-widest">Active Recall</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4">
                <p className="text-xs text-gray-400 font-medium">Test your knowledge on the current node: <span className="text-white font-semibold">{activeNode.title}</span></p>
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your explanation here..."
                    className="w-full h-32 p-4 bg-black/20 text-white rounded-2xl border border-gray-800 focus:border-indigo-600 outline-none text-sm resize-none"
                />
                <button
                    onClick={() => submitAnswer({
                        nodeId: activeNode.id,
                        roadmapId: roadmap?.id,
                        nodeTitle: activeNode.title,
                        nodeSummary: activeNode.summary,
                        sequenceOrder: activeNode.sequence_order,
                        userAnswer: answer,
                        token: session?.access_token,
                        workspaceNotes,
                    })}
                    disabled={loading || !answer.trim()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Submit Answer'}
                </button>
                {feedback && (
                    <div className={`p-4 rounded-xl text-[10px] sm:text-xs leading-relaxed ${feedback.passed ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                        {typeof feedback === 'object' ? feedback.feedback : feedback}
                    </div>
                )}
            </div>
        </div>
    );
}
