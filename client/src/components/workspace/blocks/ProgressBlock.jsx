import { Activity } from 'lucide-react';

export default function ProgressBlock({ roadmap }) {
    const progress = 45; // Mock for now, should come from roadmap metadata

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="flex items-center gap-2 mb-6 drag-handle cursor-grab active:cursor-grabbing text-indigo-400 absolute top-6 left-6">
                <Activity size={18} />
                <h3 className="font-bold text-white text-sm uppercase tracking-widest">Progress</h3>
            </div>

            <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                        className="text-gray-800 stroke-current"
                        strokeWidth="8"
                        cx="50" cy="50" r="40" fill="transparent"
                    />
                    <circle
                        className="text-indigo-500 stroke-current transition-all duration-1000"
                        strokeWidth="8"
                        strokeLinecap="round"
                        cx="50" cy="50" r="40" fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * progress) / 100}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{progress}%</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Mastered</span>
                </div>
            </div>

            <p className="text-xs text-gray-400 font-medium">12 of 28 nodes completed</p>
        </div>
    );
}
