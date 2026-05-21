// Personalized quiz + result display
import { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import {API_BASE} from '../lib/apiClient';

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
        `${API_BASE}/api/node/quiz`,
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
        `${API_BASE}/api/node/verify`,
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
    <div className="bg-black/90 border border-white/10 rounded-3xl p-6 shadow-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
          <HelpCircle size={20} />
        </div>
        <div>
          <h3 className="text-white font-bold">Active Recall</h3>
          <p className="text-xs text-white/60 uppercase tracking-widest font-semibold">{node.title}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-sm text-white/60 animate-pulse">Generating personalized questions...</p>
        </div>
      ) : result ? (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-white">{Math.round(result.score)}%</span>
              {result.passed ? <CheckCircle className="text-white" /> : <XCircle className="text-white" />}
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{result.feedback}</p>
          </div>

          {!result.passed && result.new_remediation_node && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs font-bold text-white uppercase tracking-tighter mb-1">Remediation Node Created</p>
              <p className="text-xs text-white/60">A new node has been added to your tree to help you master this concept.</p>
            </div>
          )}

          <button
            onClick={fetchQuestions}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
          >
            Retry Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={q.q_id} className="space-y-3">
              <p className="text-sm text-white/80 font-medium">
                <span className="text-white/60 mr-2">{i + 1}.</span>
                {q.question}
              </p>
              <textarea
                value={answers.find(a => a.q_id === q.q_id)?.answer || ''}
                onChange={(e) => handleAnswerChange(q.q_id, e.target.value)}
                placeholder="Type your explanation..."
                className="w-full bg-black/95 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-white/20 outline-none transition-all resize-none"
                rows={3}
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting || answers.some(a => !a.answer.trim())}
            className="w-full py-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Submit Assessment</>}
          </button>
        </div>
      )}
    </div>
  );
}