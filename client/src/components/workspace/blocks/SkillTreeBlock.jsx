import { GitBranch, Box } from 'lucide-react';

export default function SkillTreeBlock({ roadmap }) {
    const nodes = roadmap?.nodes || [];

    const colors = {
        locked: 'bg-black/90 border-white/10 text-white/40',
        unlocked: 'bg-white/10 border-white/10 text-white/60',
        completed: 'bg-white/10 border-white/10 text-white/70',
        remediation: 'bg-white/10 border-white/10 text-white/70',
    };

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex items-center gap-2 mb-6 drag-handle cursor-grab active:cursor-grabbing">
                <GitBranch className="text-white/60" size={18} />
                <h3 className="font-bold text-white text-sm uppercase tracking-widest">Skill Tree</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                {nodes.length > 0 ? nodes.map((node, i) => (
                    <div
                        key={node.id}
                        className={`p-4 rounded-2xl border ${colors[node.status]} flex items-center justify-between transition-all`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center font-bold text-xs">
                                {i + 1}
                            </div>
                            <span className="text-sm font-medium truncate max-w-[120px]">{node.title}</span>
                        </div>
                        <Box size={14} className="opacity-40" />
                    </div>
                )) : (
                    <div className="h-full flex items-center justify-center text-white/50 text-xs italic">
                        Select a roadmap to view nodes
                    </div>
                )}
            </div>
        </div>
    );
}
