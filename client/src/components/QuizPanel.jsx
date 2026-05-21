// Personalized quiz + result display
import { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function QuizPanel({ node, onVerify, session }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (node && session) {
      fetchQuestions();
    }
  }, [node, session]);

  const fetchQuestions = async () => {
    setLoading(true);
    setResult(null);
    setAnswers([]);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/node/quiz`,
        { nodeId: node.id },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setQuestions(data.questions);
      setAnswers(data.questions.map(q => ({ q_id: q.q_id, answer: '' })));
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (q_id, value) => {
    setAnswers(prev => prev.map(a => a.q_id === q_id ? { ...a, answer: value } : a));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/node/verify`,
        {
          nodeId: node.id,
          roadmapId: node.roadmap_id,
          userAnswers: answers
        },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setResult(data);
      if (data.passed) {
        onVerify(data);
      }
    } catch (err) {
      console.error('Failed to verify answers:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!node) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
          <HelpCircle size={20} />
        </div>
        <div>
          <h3 className="text-white font-bold">Active Recall</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{node.title}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-gray-500 animate-pulse">Generating personalized questions...</p>
        </div>
      ) : result ? (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${result.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-2xl font-black ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                {Math.round(result.score)}%
              </span>
              {result.passed ? <CheckCircle className="text-green-400" /> : <XCircle className="text-red-400" />}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{result.feedback}</p>
          </div>

          {!result.passed && result.new_remediation_node && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-tighter mb-1">Remediation Node Created</p>
              <p className="text-xs text-amber-200/70">A new node has been added to your tree to help you master this concept.</p>
            </div>
          )}

          <button
            onClick={fetchQuestions}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-all"
          >
            Retry Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={q.q_id} className="space-y-3">
              <p className="text-sm text-gray-300 font-medium">
                <span className="text-indigo-400 mr-2">{i + 1}.</span>
                {q.question}
              </p>
              <textarea
                value={answers.find(a => a.q_id === q.q_id)?.answer || ''}
                onChange={(e) => handleAnswerChange(q.q_id, e.target.value)}
                placeholder="Type your explanation..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-white focus:border-indigo-500 outline-none transition-all resize-none"
                rows={3}
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting || answers.some(a => !a.answer.trim())}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Submit Assessment</>}
          </button>
        </div>
      )}
    </div>
  );
}
