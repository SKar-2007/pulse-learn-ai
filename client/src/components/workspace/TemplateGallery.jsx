import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Zap, BookOpen, PenTool, X, Sparkles } from 'lucide-react';

const TEMPLATES = [
    {
        id: 'deep_research',
        name: 'Deep Research',
        desc: 'A knowledge-building workspace with dual note panels and a skill tree focus.',
        icon: <BookOpen size={20} />,
        preview: ['skill_tree', 'notes', 'notes'],
    },
    {
        id: 'exam_prep',
        name: 'Exam Prep',
        desc: 'Focused recall and progress tracking for high-stakes review.',
        icon: <Zap size={20} />,
        preview: ['quiz', 'quiz', 'progress'],
    },
    {
        id: 'writer_mode',
        name: 'Writer Mode',
        desc: 'Minimal interface, large note area, and distraction-free flow.',
        icon: <PenTool size={20} />,
        preview: ['notes'],
    },
];

const TYPE_LABELS = {
    skill_tree: 'Skill Tree',
    notes: 'Notes',
    quiz: 'Quiz',
    progress: 'Progress',
};

export default function TemplateGallery({ isOpen, onClose, onApply }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-[60]" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-[0_35px_120px_rgba(15,23,42,0.65)] z-[70] overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-800 flex flex-col gap-3 bg-slate-950/80">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight">Workspace Templates</h2>
                                <p className="text-sm text-slate-400 font-medium max-w-2xl">Pick a curated layout that matches your learning goal, then refine the workspace with AI-powered guidance.</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-500">
                                <Sparkles size={14} />
                                <span>Designed for faster knowledge flow</span>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 gap-4 overflow-y-auto max-h-[65vh]">
                            {TEMPLATES.map((tmpl) => (
                                <motion.button
                                    key={tmpl.id}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => {
                                        onApply(tmpl.preview.map((type, index) => ({ i: `${tmpl.id}-${index}`, x: index * 4, y: 0, w: type === 'notes' ? 12 : 6, h: type === 'progress' ? 2 : 4, type, config: {} })));
                                        onClose();
                                    }}
                                    className="group rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 text-left shadow-lg shadow-indigo-500/10 transition-all hover:border-indigo-500/70"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-300 shadow-inner shadow-black/20 transition-all group-hover:bg-indigo-600">
                                                {tmpl.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white">{tmpl.name}</h3>
                                                <p className="text-sm text-slate-400 mt-1 max-w-xl">{tmpl.desc}</p>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-indigo-300">Apply</span>
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-3">
                                        {tmpl.preview.map((type, index) => (
                                            <div key={type + index} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-3 text-[11px] text-slate-400 flex flex-col justify-between">
                                                <span className="font-bold text-slate-100">{TYPE_LABELS[type]}</span>
                                                <span className="text-[10px] text-slate-500">{type === 'notes' ? 'Large notes area' : type === 'quiz' ? 'Active practice' : type === 'progress' ? 'Progress summary' : 'Structured flow'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
