import { useState } from 'react';
import axios from 'axios';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export default function useQuiz() {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitAnswer = async ({ nodeId, userAnswers, userAnswer, roadmapId, token, workspaceNotes }) => {
    setLoading(true);
    try {
      const isDemo = DEMO_MODE || token === 'demo';
      if (isDemo) {
        const demoData = {
          passed: true,
          score: 100,
          feedback: { passed: true, feedback: 'Demo verification passed. Great job!' },
          node: { id: nodeId },
        };
        setFeedback(demoData.feedback);
        return demoData;
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/node/verify`,
        {
          nodeId,
          roadmapId,
          userAnswers: userAnswers || [{ q_id: 1, answer: userAnswer }],
          workspaceNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeedback(data.feedback);
      return data;
    } catch (error) {
      console.error('Quiz verification failed:', error);
      setFeedback(error.response?.data?.error || 'Verification failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearFeedback = () => {
    setFeedback(null);
    setAnswer('');
  };

  return { answer, setAnswer, feedback, loading, submitAnswer, clearFeedback };
}
