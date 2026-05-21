// Individual node card with status indicators and hover effects
import { CheckCircle2, Lock, Unlock, PlayCircle, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  locked: {
    bg: 'bg-gray-900',
    border: 'border-gray-800',
    icon: <Lock size={16} className="text-gray-600" />,
    textColor: 'text-gray-500',
    label: 'Locked',
  },
  unlocked: {
    bg: 'bg-indigo-500/5',
    border: 'border-indigo-500/20',
    icon: <PlayCircle size={16} className="text-indigo-400" />,
    textColor: 'text-gray-300',
    label: 'Ready to Start',
  },
  completed: {
    bg: 'bg-green-500/5',
    border: 'border-green-500/20',
    icon: <CheckCircle2 size={16} className="text-green-400" />,
    textColor: 'text-gray-400',
    label: 'Mastered',
  },
  remediation: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    icon: <AlertCircle size={16} className="text-amber-400" />,
    textColor: 'text-gray-300',
    label: 'Review Needed',
  },
};

export default function NodeCard({ title, summary, status, isSelected }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.locked;

  return (
    <div className={`p-5 rounded-2xl border-2 transition-all duration-300 group ${config.bg} ${config.border} ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-[1.02]' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-800 text-[10px] font-bold uppercase tracking-wider ${config.textColor}`}>
          {config.label}
        </div>
        {config.icon}
      </div>

      <h3 className={`font-bold mb-2 group-hover:text-white transition-colors ${status === 'locked' ? 'text-gray-600' : 'text-white'}`}>
        {title}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
        {summary}
      </p>

      {status !== 'locked' && (
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-tighter">Active Recall Ready</span>
          <div className="flex -space-x-2">
            {[1, 2].map(i => (
              <div key={i} className="w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-900 text-[8px] flex items-center justify-center font-bold text-gray-500">
                {i}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
