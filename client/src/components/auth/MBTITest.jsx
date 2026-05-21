import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MBTI_QUESTIONS } from '../../lib/mbtiQuestions';
import axios from 'axios';
import {API_BASE} from '../../lib/apiClient';

export default function MBTITest({ session, onComplete }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [saving, setSaving] = useState(false);

    const question = MBTI_QUESTIONS[currentQ];
    const progress = (currentQ / MBTI_QUESTIONS.length) * 100;

    const handleAnswer = async (choice) => {
        const newAnswers = [...answers, { questionId: question.id, answer: choice }];
        setAnswers(newAnswers);

        if (currentQ < MBTI_QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQ(currentQ + 1), 200);
        } else {
            setSaving(true);
            try {
                const { data } = await axios.post(
                    `${API_BASE}/api/user/mbti`,
                    { answers: newAnswers },
                    { headers: { Authorization: `Bearer ${session.access_token}` } }
                );
                setResult(data.profile);
            } catch (err) {
                console.error('MBTI save failed:', err);
            } finally {
                setSaving(false);
            }
        }
    };

    if (result) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-screen bg-gray-950 flex items-center justify-center p-8"
            >
                <div className="max-w-md w-full text-center">
                    <div className="text-7xl mb-6">🧠</div>
                    <h2 className="text-4xl font-bold text-indigo-400 mb-2">{result.mbti_type}</h2>
                    <p className="text-gray-300 text-lg mb-2">
                        You are: <span className="text-white font-semibold">{result.typeName}</span>
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8">{result.cognitiveStyle}</p>
                    <p className="text-indigo-300 text-sm mb-8">
                        Pulse-Learn AI will now adapt every lesson, quiz, and piece of feedback to match how your mind works.
                    </p>
                    <button
                        onClick={() => onComplete(result)}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-lg transition-all"
                    >
                        Enter My Learning Workspace →
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
            <div className="max-w-lg w-full">
                <div className="mb-2 flex justify-between text-xs text-gray-500">
                    <span>Question {currentQ + 1} of {MBTI_QUESTIONS.length}</span>
                    <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full mb-10 overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-500 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                    >
                        <p className="text-xs text-indigo-400 font-mono uppercase tracking-wider mb-4">
                            {question.dimension === 'EI' && 'Energy Direction'}
                            {question.dimension === 'SN' && 'Information Processing'}
                            {question.dimension === 'TF' && 'Decision Making'}
                            {question.dimension === 'JP' && 'Structure Preference'}
                        </p>
                        <h2 className="text-xl font-bold text-white mb-10 leading-relaxed">
                            {question.question}
                        </h2>

                        <div className="space-y-4">
                            {['A', 'B'].map((choice) => {
                                const opt = choice === 'A' ? question.optionA : question.optionB;
                                return (
                                    <motion.button
                                        key={choice}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAnswer(choice)}
                                        className="w-full text-left px-6 py-5 rounded-2xl border border-gray-700 bg-gray-900 
                      hover:border-indigo-500 hover:bg-indigo-950 transition-all duration-200 text-white text-base"
                                    >
                                        <span className="text-indigo-400 font-mono mr-3">{choice}.</span>
                                        {opt.label}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {saving && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-indigo-400 mt-10 animate-pulse text-sm"
                    >
                        Analyzing your cognitive profile...
                    </motion.p>
                )}
            </div>
        </div>
    );
}