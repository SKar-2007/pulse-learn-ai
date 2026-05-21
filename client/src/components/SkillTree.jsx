// SVG-based Skill Tree with curved paths and dynamic positioning
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function SkillTree({ nodes, selectedNodeId }) {
  // Filter core nodes vs remediation nodes
  const coreNodes = nodes.filter(n => n.remediation_depth === 0);

  return (
    <div className="relative bg-black/90 border border-white/10 rounded-3xl p-12 overflow-hidden min-h-[400px] flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative flex flex-col items-center gap-16">
        {coreNodes.map((node, i) => (
          <div key={node.id} className="relative flex flex-col items-center">
            {/* Connection Line to next node */}
            {i < coreNodes.length - 1 && (
              <div className="absolute top-full h-16 w-0.5 bg-gradient-to-b from-white/30 to-transparent" />
            )}

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
                ${node.status === 'completed' ? 'bg-white/10 border-white/10 text-white' :
                  node.status === 'unlocked' ? 'bg-white/10 text-white shadow-xl shadow-black/20 border-white/10' :
                    'bg-black/95 border border-white/10 text-white/60'}`}
            >
              {node.status === 'completed' ? <CheckIcon /> : <Target size={24} />}

              {/* Radial Progress Ring for active node */}
              {node.id === selectedNodeId && (
                <div className="absolute inset-[-8px] border-2 border-white/20 rounded-[20px] animate-pulse" />
              )}
            </motion.div>

            {/* Label */}
            <div className={`absolute left-full ml-6 top-1/2 -translate-y-1/2 whitespace-nowrap
              ${node.status === 'locked' ? 'text-white/40' : 'text-white/70'}`}>
              <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Module {i + 1}</p>
              <p className="text-sm font-bold">{node.title}</p>
            </div>

            {/* Remediation indicator side-car */}
            {nodes.some(rn => rn.parent_node_id === node.id) && (
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 flex gap-1">
                {nodes.filter(rn => rn.parent_node_id === node.id).map(rn => (
                  <div key={rn.id} className="w-2 h-2 rounded-full bg-white/50 animate-pulse" title="Remediation active" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
