import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function useQuiz() {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitAnswer = async ({ nodeId, userAnswer, expectedSummary, roadmapId, token }) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/node/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nodeId, userAnswer, expectedSummary, roadmapId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Quiz verification failed');
      }

      setFeedback(data.feedback || 'Review complete.');
      return { score: data.score ?? 0, feedback: data.feedback };
    } catch (error) {
      setFeedback(error.message);
      return { score: 0, feedback: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearFeedback = () => setFeedback(null);

  return { answer, setAnswer, feedback, loading, submitAnswer, clearFeedback };
}
