import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Sparkles, Brain, Zap, Target, MessageSquare, Clock, GraduationCap, ChevronRight, Check } from 'lucide-react';

const STEPS = [
    {
        key: 'expertise_level',
        question: "What's your current proficiency?",
        icon: <GraduationCap className="text-indigo-400" size={24} />,
        options: [
            { value: 'beginner', label: 'Beginner', desc: 'Start with core fundamentals', icon: '🌱' },
            { value: 'intermediate', label: 'Intermediate', desc: 'Build on existing knowledge', icon: '📚' },
            { value: 'advanced', label: 'Advanced', desc: 'Focus on technical deep dives', icon: '🔬' },
            { value: 'expert', label: 'Expert', desc: 'High-level architectural review', icon: '🎓' },
        ],
    },
    {
        key: 'learning_style',
        question: 'How do you process information?',
        icon: <Brain className="text-pink-400" size={24} />,
        options: [
            { value: 'visual', label: 'Visual', desc: 'Diagrams, maps, and flowcharts', icon: '🎨' },
            { value: 'reading', label: 'Reading', desc: 'Dense prose and sub-points', icon: '📖' },
            { value: 'kinesthetic', label: 'Kinesthetic', desc: 'Problems and worked examples', icon: '🛠️' },
            { value: 'auditory', label: 'Auditory', desc: 'Conversational explanations', icon: '🎧' },
        ],
    },
    {
        key: 'communication_tone',
        question: 'What is your ideal mentor style?',
        icon: <MessageSquare className="text-blue-400" size={24} />,
        options: [
            { value: 'friendly', label: 'Friendly', desc: 'Encouraging and celebratory', icon: '😊' },
            { value: 'direct', label: 'Direct', desc: 'Concise and no-fluff', icon: '⚡' },
            { value: 'socratic', label: 'Socratic', desc: 'Probing questions and thinking', icon: '🤔' },
            { value: 'formal', label: 'Formal', desc: 'Precise and academic', icon: '🎩' },
        ],
    },
    {
        key: 'study_domain',
        question: 'What is your primary domain?',
        icon: <Target className="text-green-400" size={24} />,
        options: [
            { value: 'computer_science', label: 'Tech & CS', desc: 'Algorithms and systems', icon: '💻' },
            { value: 'medicine', label: 'Medicine', desc: 'Clinical and biological', icon: '🏥' },
            { value: 'business', label: 'Business', desc: 'Market and strategy', icon: '📊' },
            { value: 'humanities', label: 'Humanities', desc: 'Philosophical and social', icon: '📜' },
        ],
    },
    {
        key: 'preferred_session_minutes',
        question: 'Ideal session length?',
        icon: <Clock className="text-amber-400" size={24} />,
        options: [
            { value: 15, label: 'Turbo', desc: '15 min focused bursts', icon: '⚡' },
            { value: 30, label: 'Standard', desc: '30 min Pomodoro blocks', icon: '📐' },
            { value: 60, label: 'Deep Work', desc: '60 min intense focus', icon: '🔥' },
            { value: 90, label: 'Marathon', desc: '90 min deep immersion', icon: '🧠' },
        ],
    },
];

import MBTITest from './MBTITest';
import {API_BASE} from '../../lib/apiClient';

export default function PersonalityOnboarding({ session, onComplete }) {
    const [step, setStep] = useState(-1); // -1 for MBTI test
    const [mbtiType, setMbtiType] = useState(null);
    const [answers, setAnswers] = useState({});
    const [saving, setSaving] = useState(false);

    const handleMBTIComplete = (type) => {
        setMbtiType(type);
        setStep(0);
    };

    const handleSelect = (value) => {
        const newAnswers = { ...answers, [STEPS[step].key]: value };
        setAnswers(newAnswers);

        if (step < STEPS.length - 1) {
            setTimeout(() => setStep(step + 1), 300);
        } else {
            handleSave({ ...newAnswers, mbti_type: mbtiType });
        }
    };

    const handleSave = async (finalAnswers) => {
        setSaving(true);
        try {
            const { data } = await axios.post(
                `${API_BASE}/api/user/profile`,
                finalAnswers,
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            // Show loading state for a bit longer to feel "agentic"
            setTimeout(() => {
                onComplete(data.profile);
            }, 1500);
        } catch (err) {
            console.error('Failed to save profile', err);
            setSaving(false);
        }
    };

    if (step === -1) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-indigo-600 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-blue-600 rounded-full blur-[100px] animate-pulse delay-1000" />
                </div>
                <div className="max-w-xl w-full z-10">
                    <header className="mb-12 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                            <Sparkles size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Psychometric Phase</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-4">
                            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">MBTI Type</span>
                        </h1>
                        <p className="text-gray-400 font-medium">This helps us tailor the AI's teaching patterns to your cognition.</p>
                    </header>
                    <MBTITest onComplete={handleMBTIComplete} />
                </div>
            </div>
        );
    }

    const current = STEPS[step];

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-indigo-600 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-blue-600 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="max-w-2xl w-full relative z-10">
                {!saving ? (
                    <>
                        <header className="mb-12 text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                                <Sparkles size={14} className="text-indigo-400" />
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Initialization Phase</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight mb-4">
                                Calibrating Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Persona</span>
                            </h1>
                            <p className="text-gray-400 font-medium">Step {step + 1} of {STEPS.length} — Build your unique learning engine.</p>
                        </header>

                        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 h-1 bg-gray-800 w-full">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-600 to-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800">
                                            {current.icon}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white leading-tight">{current.question}</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {current.options.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleSelect(opt.value)}
                                                className={`group text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden
                          ${answers[current.key] === opt.value
                                                        ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-900/40'
                                                        : 'bg-gray-950/50 border-gray-800 hover:border-gray-600 hover:bg-gray-900'}`}
                                            >
                                                <div className="relative z-10">
                                                    <div className="text-2xl mb-3">{opt.icon}</div>
                                                    <h3 className={`font-bold transition-colors ${answers[current.key] === opt.value ? 'text-white' : 'text-gray-200'}`}>
                                                        {opt.label}
                                                    </h3>
                                                    <p className={`text-xs mt-1 transition-colors ${answers[current.key] === opt.value ? 'text-white/70' : 'text-gray-500'}`}>
                                                        {opt.desc}
                                                    </p>
                                                </div>
                                                {answers[current.key] === opt.value && (
                                                    <motion.div
                                                        layoutId="check"
                                                        className="absolute top-4 right-4 text-white"
                                                    >
                                                        <Check size={18} />
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-12 text-center"
                    >
                        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
                            <div className="absolute inset-0 bg-indigo-600 rounded-3xl animate-ping opacity-20" />
                            <Zap size={40} className="text-white fill-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">Building Your Engine</h2>
                        <div className="space-y-3 max-w-xs mx-auto">
                            {['Analyzing expertise...', 'Applying learning style...', 'Calibrating tone...'].map((text, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.4 }}
                                    className="flex items-center gap-3 text-gray-400 text-sm"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    {text}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}