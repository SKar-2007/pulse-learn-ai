import { useMemo } from 'react';
import { CheckSquare, Loader2 } from 'lucide-react';
import useQuiz from '../../../hooks/useQuiz';

export default function QuizBlock({ roadmap, session, config, onConfigChange, workspaceNotes, onVerify }) {
    const activeNode = useMemo(() => {
        return roadmap?.nodes?.find((node) => node.status === 'unlocked') || roadmap?.nodes?.[0];
    }, [roadmap]);

    const { answer, setAnswer, feedback, loading, submitAnswer } = useQuiz();

    if (!roadmap || !activeNode) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-black/90 rounded-3xl border border-white/10">
                <p className="text-sm text-white/50">Select a roadmap to activate the quiz widget.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex items-center gap-2 mb-6 drag-handle cursor-grab active:cursor-grabbing text-white/60">
                <CheckSquare size={18} />
                <h3 className="font-bold text-white text-sm uppercase tracking-widest">Active Recall</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4">
                <p className="text-xs text-white/50 font-medium">Test your knowledge on the current node: <span className="text-white font-semibold">{activeNode.title}</span></p>
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your explanation here..."
                    className="w-full h-32 p-4 bg-black/20 text-white rounded-2xl border border-white/10 focus:border-white/20 outline-none text-sm resize-none"
                />
                <button
                    onClick={async () => {
                        const result = await submitAnswer({
                            nodeId: activeNode.id,
                            roadmapId: roadmap?.id,
                            nodeTitle: activeNode.title,
                            nodeSummary: activeNode.summary,
                            sequenceOrder: activeNode.sequence_order,
                            userAnswer: answer,
                            token: session?.access_token,
                            workspaceNotes,
                        });
                        onVerify?.(result);
                    }}
                    disabled={loading || !answer.trim()}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Submit Answer'}
                </button>
                {feedback && (
                    <div className={`p-4 rounded-xl text-[10px] sm:text-xs leading-relaxed ${feedback.passed ? 'bg-white/10 text-white' : 'bg-white/10 text-white'}`}>
                        {typeof feedback === 'object' ? feedback.feedback : feedback}
                    </div>
                )}
            </div>
        </div>
    );
}
