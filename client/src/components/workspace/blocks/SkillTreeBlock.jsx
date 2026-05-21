import { GitBranch, Box } from 'lucide-react';

export default function SkillTreeBlock({ roadmap }) {
    const nodes = roadmap?.nodes || [];

    const colors = {
        locked: 'bg-gray-800 border-gray-700 text-gray-500',
        unlocked: 'bg-indigo-900/20 border-indigo-500/40 text-indigo-300',
        completed: 'bg-green-900/20 border-green-500/40 text-green-400',
        remediation: 'bg-orange-900/20 border-orange-500/40 text-orange-400',
    };

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex items-center gap-2 mb-6 drag-handle cursor-grab active:cursor-grabbing">
                <GitBranch className="text-indigo-400" size={18} />
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
                    <div className="h-full flex items-center justify-center text-gray-600 text-xs italic">
                        Select a roadmap to view nodes
                    </div>
                )}
            </div>
        </div>
    );
}
