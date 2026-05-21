import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GitBranch, BarChart2, CheckSquare, FileText, Activity,
    LayoutGrid, Search, Sparkles, PlusCircle, PenTool, Share2, Bot
} from 'lucide-react';

const BLOCK_TYPES = [
    { type: 'skill_tree', label: 'Skill Tree', icon: <GitBranch size={16} />, desc: 'Adaptive learning path' },
    { type: 'quiz', label: 'Active Recall', icon: <CheckSquare size={16} />, desc: 'AI-generated assessment' },
    { type: 'analytics', label: 'Learning Charts', icon: <BarChart2 size={16} />, desc: 'Visual progress charts' },
    { type: 'notes', label: 'Notes', icon: <FileText size={16} />, desc: 'Rich-text study notes' },
    { type: 'progress', label: 'Stats Ring', icon: <Activity size={16} />, desc: 'Completion metrics' },
    { type: 'summary', label: 'Smart Brief', icon: <Sparkles size={16} />, desc: 'AI synthesis of workspace' },
    { type: 'loop_component', label: 'Loop Component', icon: <Share2 size={16} />, desc: 'Embed a live shared block' },
    { type: 'recap', label: 'AI Recap', icon: <Sparkles size={16} />, desc: 'AI-generated page summary' },
    { type: 'ai_chat', label: 'AI Assistant', icon: <Bot size={16} />, desc: 'In-canvas intelligence' },
];

export default function BlockPalette({ onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && !isOpen) {
                // Focus search or just open?
                setIsOpen(true);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const filtered = BLOCK_TYPES.filter(b =>
        b.label.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/10 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold transition-all z-40 border border-white/10"
        >
            <PlusCircle size={20} /> Add Block <span className="opacity-50 text-xs font-normal">(/)</span>
        </button>
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 w-80 bg-black/95 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
                <div className="p-4 border-b border-white/10 flex items-center gap-2">
                    <Search className="text-white/60" size={16} />
                    <input
                        autoFocus
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search blocks..."
                        className="bg-transparent border-none outline-none text-white text-sm w-full"
                    />
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                    {filtered.map((b) => (
                        <button
                            key={b.type}
                            onClick={() => {
                                onSelect(b.type);
                                setIsOpen(false);
                                setSearch('');
                            }}
                            className="w-full text-left p-3 hover:bg-white/10 rounded-xl flex items-center gap-3 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white group-hover:bg-white/10 transition-all">
                                {b.icon}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{b.label}</p>
                                <p className="text-[10px] text-white/50">{b.desc}</p>
                            </div>
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-center py-4 text-xs text-white/50">No blocks found</p>
                    )}
                </div>
            </motion.div>
            <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setIsOpen(false)}
            />
        </AnimatePresence>
    );
}
