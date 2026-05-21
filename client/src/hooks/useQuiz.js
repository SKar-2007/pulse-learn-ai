import { useState } from 'react';

export default function useQuiz() {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const submitAnswer = async (nodeId) => {
    // Placeholder for quiz submit logic.
  };

  return { answer, setAnswer, feedback, submitAnswer };
}
