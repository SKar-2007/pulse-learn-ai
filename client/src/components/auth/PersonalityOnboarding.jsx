// React multi-step onboarding wizard: 5 questions about learning style, expertise, tone, domain, schedule
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const STEPS = [
    {
        key: 'expertise_level',
        question: "How would you describe your current knowledge level in the subject you're about to study?",
        options: [
            { value: 'beginner', label: '🌱 Complete beginner — start from scratch' },
            { value: 'intermediate', label: '📚 Some background — I know the basics' },
            { value: 'advanced', label: '🔬 Advanced — I want focused deep dives' },
            { value: 'expert', label: '🎓 Expert — I just need structured review' },
        ],
    },
    {
        key: 'learning_style',
        question: 'How do you learn best?',
        options: [
            { value: 'visual', label: '🎨 Visual — diagrams, flowcharts, maps' },
            { value: 'reading', label: '📖 Reading — detailed written explanations' },
            { value: 'kinesthetic', label: '🛠️ Hands-on — examples and practice problems' },
            { value: 'auditory', label: '🎧 Conversational — explain it like you\'d tell a friend' },
        ],
    },
    {
        key: 'communication_tone',
        question: 'What teaching style feels most natural to you?',
        options: [
            { value: 'friendly', label: '😊 Friendly & encouraging — keep it warm' },
            { value: 'direct', label: '⚡ Direct & concise — no fluff' },
            { value: 'socratic', label: '🤔 Socratic — ask me questions, make me think' },
            { value: 'formal', label: '🎩 Formal — academic and precise' },
        ],
    },
    {
        key: 'study_domain',
        question: 'What is your primary field of study or work?',
        options: [
            { value: 'computer_science', label: '💻 Computer Science / Engineering' },
            { value: 'medicine', label: '🏥 Medicine / Life Sciences' },
            { value: 'business', label: '📊 Business / Finance' },
            { value: 'humanities', label: '📜 Humanities / Law / Social Sciences' },
        ],
    },
    {
        key: 'preferred_session_minutes',
        question: 'How long is your ideal single study session?',
        options: [
            { value: 15, label: '⚡ 15 min — quick focused bursts' },
            { value: 30, label: '📐 30 min — standard Pomodoro' },
            { value: 60, label: '🔥 60 min — deep work sessions' },
            { value: 90, label: '🧠 90 min — marathon focus blocks' },
        ],
    },
];

export default function PersonalityOnboarding({ session, onComplete }) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [saving, setSaving] = useState(false);

    const handleSelect = (value) => {
        const newAnswers = { ...answers, [STEPS[step].key]: value };
        setAnswers(newAnswers);

        if (step < STEPS.length - 1) {
            setTimeout(() => setStep(step + 1), 300);
        } else {
            handleSave(newAnswers);
        }
    };

    const handleSave = async (finalAnswers) => {
        setSaving(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/user/profile`,
                finalAnswers,
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            onComplete(res.data.profile);
        } catch (err) {
            console.error('Failed to save profile:', err);
            setSaving(false);
        }
    };

    const current = STEPS[step];

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
            <div className="max-w-xl w-full">
                {/* Progress bar */}
                <div className="flex gap-2 mb-10">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-indigo-500' : 'bg-gray-700'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-gray-400 text-sm mb-2">Question {step + 1} of {STEPS.length}</p>
                        <h2 className="text-2xl font-bold text-white mb-8">{current.question}</h2>
                        <div className="space-y-3">
                            {current.options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className="w-full text-left px-5 py-4 rounded-xl border border-gray-700 bg-gray-900 
                    hover:border-indigo-500 hover:bg-indigo-950 transition-all duration-200 text-white"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {saving && (
                    <p className="text-center text-indigo-400 mt-8 animate-pulse">
                        Building your personalized learning engine...
                    </p>
                )}
            </div>
        </div>
    );
}
