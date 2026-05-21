import { BarChart2 } from 'lucide-react';
import ChartRenderer from '../../analytics/ChartRenderer';
import { useState } from 'react';

export default function ChartBlock({ config }) {
    // Mock data for demo if no config provided
    const defaultData = {
        type: 'bar',
        title: 'Node Mastery',
        data: [
            { name: 'Fundamentals', score: 85 },
            { name: 'Advanced Concepts', score: 40 },
            { name: 'Case Studies', score: 10 },
        ],
        keys: ['score'],
        colors: ['#6366f1']
    };

    const finalConfig = config || defaultData;

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex items-center gap-2 mb-6 drag-handle cursor-grab active:cursor-grabbing text-white/60">
                <BarChart2 size={18} />
                <h3 className="font-bold text-white text-sm uppercase tracking-widest">Analytics</h3>
            </div>

            <div className="flex-1 w-full overflow-hidden">
                <ChartRenderer config={finalConfig} />
            </div>
        </div>
    );
}
