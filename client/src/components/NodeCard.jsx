// Individual node card with status indicators and hover effects
import { CheckCircle2, Lock, Unlock, PlayCircle, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  locked: {
    bg: 'bg-black/95',
    border: 'border-white/10',
    icon: <Lock size={16} className="text-white/40" />,
    textColor: 'text-white/50',
    label: 'Locked',
  },
  unlocked: {
    bg: 'bg-white/10',
    border: 'border-white/10',
    icon: <PlayCircle size={16} className="text-white" />,
    textColor: 'text-white/70',
    label: 'Ready to Start',
  },
  completed: {
    bg: 'bg-white/10',
    border: 'border-white/10',
    icon: <CheckCircle2 size={16} className="text-white" />,
    textColor: 'text-white/70',
    label: 'Mastered',
  },
  remediation: {
    bg: 'bg-white/10',
    border: 'border-white/10',
    icon: <AlertCircle size={16} className="text-white" />,
    textColor: 'text-white/70',
    label: 'Review Needed',
  },
};

export default function NodeCard({ title, summary, status, isSelected }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.locked;

  return (
    <div className={`p-5 rounded-2xl border-2 transition-all duration-300 group ${config.bg} ${config.border} ${isSelected ? 'border-white/20 ring-4 ring-white/10 scale-[1.02]' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`px-2.5 py-1 rounded-lg bg-black/90 border border-white/10 text-[10px] font-bold uppercase tracking-wider ${config.textColor}`}>
          {config.label}
        </div>
        {config.icon}
      </div>

      <h3 className={`font-bold mb-2 group-hover:text-white transition-colors ${status === 'locked' ? 'text-white/60' : 'text-white'}`}>
        {title}
      </h3>
      <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
        {summary}
      </p>

      {status !== 'locked' && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">Active Recall Ready</span>
          <div className="flex -space-x-2">
            {[1, 2].map(i => (
              <div key={i} className="w-5 h-5 rounded-full bg-white/5 border-2 border-white/10 text-[8px] flex items-center justify-center font-bold text-white/60">
                {i}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
