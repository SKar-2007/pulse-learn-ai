import { Lock, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const statusStyles = {
  locked: 'bg-gray-800 border-gray-700 opacity-50 grayscale cursor-not-allowed',
  unlocked: 'bg-gray-900 border-indigo-500 cursor-pointer animate-pulse-glow',
  completed: 'bg-green-950 border-green-500 cursor-pointer',
};

const StatusIcon = ({ status, score }) => {
  if (status === 'locked') return <Lock className="w-5 h-5 text-gray-500" />;
  if (status === 'completed') return (
    <div className="flex items-center gap-1">
      <CheckCircle className="w-5 h-5 text-green-400" />
      {score && <span className="text-xs text-green-400 font-mono">{score}%</span>}
    </div>
  );
  return <Zap className="w-5 h-5 text-indigo-400" />;
};

export default function NodeCard({ node, onSelect, isSelected, score }) {
  const isClickable = node.status !== 'locked';

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.03 } : {}}
      whileTap={isClickable ? { scale: 0.97 } : {}}
      onClick={() => isClickable && onSelect(node)}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300 w-56
        ${statusStyles[node.status]}
        ${isSelected ? 'ring-2 ring-white' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-400 font-mono">#{node.sequence_order}</span>
        <StatusIcon status={node.status} score={score} />
      </div>
      <h3 className="text-sm font-semibold text-white leading-snug">{node.title}</h3>
      <p className="text-xs text-gray-400 mt-1">{node.estimated_minutes} min</p>
      {node.parent_node_id && (
        <span className="absolute -top-2 left-3 text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">
          Remediation
        </span>
      )}
    </motion.div>
  );
}
