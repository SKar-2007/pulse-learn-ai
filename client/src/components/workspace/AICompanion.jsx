import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, MessageSquare, Brain, Layout, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AICompanion({ session, roadmap, profile, workspaceNotes, isOpen, onToggle, messages = [], onSend, loading }) {
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading || !onSend) return;
        const userMsg = input.trim();
        setInput('');
        await onSend(userMsg);
    };

    const status = loading ? 'Thinking through your request...' : 'Ready to refine your learning process.';
    const displayedMessages = messages.length ? messages : [{ role: 'assistant', content: `Hello ${session?.user?.email?.split('@')[0] || 'Learner'}! I'm your ${profile?.mbti_type || 'AI'} learning companion. Ask me to summarize your workspace, create study goals, or improve your notes.` }];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 420, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 420, opacity: 0 }}
                    className="fixed right-6 top-24 bottom-6 w-[390px] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-[0_35px_120px_rgba(15,23,42,0.55)] flex flex-col overflow-hidden z-50"
                >
                    <div className="p-6 border-b border-slate-800 bg-slate-950/90">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Sparkles size={22} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-indigo-300">AI Learning Coach</p>
                                    <h3 className="text-lg font-black text-white">{profile.mbti_type} Companion</h3>
                                </div>
                            </div>
                            <button
                                onClick={onToggle}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 transition-all"
                            >
                                <Minimize2 size={16} />
                            </button>
                        </div>
                        <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-400 leading-5">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-slate-200">Gemini 1.5 Flash</span>
                                <span className="text-slate-500">Workspace context</span>
                            </div>
                            <p className="mt-2">Ask for summaries, follow-up tasks, or learning strategy tailored to your cognitive profile.</p>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                        {displayedMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[82%] rounded-[2rem] p-4 text-sm leading-6 ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none shadow-xl shadow-indigo-500/10'
                                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2 rounded-[2rem] border border-slate-800 bg-slate-900/85 px-4 py-3">
                                    <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 0.9 }} className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                                    <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.15 }} className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                                    <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.3 }} className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                                    <span className="text-xs text-slate-500">Generating insight...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-5 border-t border-slate-800 bg-slate-950/90">
                        <div className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask the coach for a workspace summary..."
                                className="w-full min-h-[76px] resize-none rounded-[1.85rem] border border-slate-800 bg-slate-900/80 px-5 py-4 pr-16 text-sm text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-40 transition-all"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <div className="mt-4 grid gap-3">
                            <QuickAction icon={<Brain size={14} />} label="Summarize my workspace" onClick={() => onSend?.('Summarize everything in my workspace and suggest a study plan.')} />
                            <QuickAction icon={<Layout size={14} />} label="Create next steps" onClick={() => onSend?.('What should I focus on next based on my current work?')} />
                            <QuickAction icon={<MessageSquare size={14} />} label="Polish my notes" onClick={() => onSend?.('Rewrite my notes into a sharper, easier-to-review summary.')} />
                        </div>
                    </div>
                    <div className="px-5 pb-5 text-xs text-slate-500">{status}</div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function QuickAction({ icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:border-indigo-500 hover:bg-slate-800 transition-all flex items-center gap-3"
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
