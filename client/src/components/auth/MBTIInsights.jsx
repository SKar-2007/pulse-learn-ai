import { motion } from 'framer-motion';
import { Brain, Zap, Target, MessageSquare } from 'lucide-react';

export default function MBTIInsights({ profile }) {
    const { ei_score, sn_score, tf_score, jp_score, mbti_type } = profile;

    const dimensions = [
        { label: 'Energy', left: 'Introvert', right: 'Extravert', score: ei_score, icon: <Zap size={16} />, color: 'from-blue-500 to-indigo-500' },
        { label: 'Information', left: 'Sensing', right: 'Intuitive', score: sn_score, icon: <Brain size={16} />, color: 'from-purple-500 to-fuchsia-500' },
        { label: 'Decision', left: 'Thinking', right: 'Feeling', score: tf_score, icon: <Target size={16} />, color: 'from-emerald-500 to-teal-500' },
        { label: 'Structure', left: 'Judging', right: 'Perceiving', score: jp_score, icon: <MessageSquare size={16} />, color: 'from-orange-500 to-red-500' },
    ];

    return (
        <div className="bg-black/90/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tight mb-2">
                            {mbti_type} <span className="text-white/60 font-light text-2xl ml-2">Personality</span>
                        </h2>
                        <p className="text-sm text-white/50 font-medium uppercase tracking-[0.2em]">Cognitive Profile Analysis</p>
                    </div>
                </div>

                <div className="space-y-10">
                    {dimensions.map((dim, idx) => {
                        const leansLeft = dim.score < 0;
                        const magnitude = Math.abs(dim.score) * 10; // 0-50% from center

                        return (
                            <motion.div
                                key={dim.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="flex justify-between items-end mb-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${leansLeft ? 'text-white/60' : 'text-white/50'}`}>{dim.left}</span>
                                    <span className="text-xs font-bold text-white uppercase tracking-tighter flex items-center gap-2">
                                        {dim.icon} {dim.label}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${!leansLeft ? 'text-white/60' : 'text-white/50'}`}>{dim.right}</span>
                                </div>
                                <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 z-10" />
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${magnitude}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className={`h-full absolute top-0 ${leansLeft ? 'right-1/2 rounded-l-full' : 'left-1/2 rounded-r-full'} bg-gradient-to-r ${dim.color} shadow-[0_0_20px_rgba(99,102,241,0.4)]`}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-sm text-white/60 leading-relaxed italic">
                        "Your cognitive style indicates a preference for {dimensions.find(d => Math.abs(d.score) > 2.5)?.label.toLowerCase() || 'balanced'} discovery.
                        Gemini has calibrated all assessing engine parameters to match this profile."
                    </p>
                </div>
            </div>
        </div>
    );
}
