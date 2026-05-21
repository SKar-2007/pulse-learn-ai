import { useState, useCallback } from 'react';
import { Responsive } from 'react-grid-layout';
import { motion } from 'framer-motion';
import { X, Share2, Sparkles, MessageSquare } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import SkillTreeBlock from './blocks/SkillTreeBlock';
import QuizBlock from './blocks/QuizBlock';
import ChartBlock from './blocks/ChartBlock';
import NotesBlock from './blocks/NotesBlock';
import ProgressBlock from './blocks/ProgressBlock';
import SummaryBlock from './blocks/SummaryBlock';
import RecapBlock from './RecapBlock';
import LoopComponentViewer from './LoopComponentViewer';

const ResponsiveGridLayout = Responsive;

const BLOCK_COMPONENTS = {
    skill_tree: SkillTreeBlock,
    quiz: QuizBlock,
    analytics: ChartBlock,
    notes: NotesBlock,
    progress: ProgressBlock,
    summary: SummaryBlock,
    loop_component: LoopComponentViewer,
    recap: RecapBlock,
    ai_chat: ({ workspaceNotes }) => (
      <div className="h-full w-full p-4 rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 text-slate-200 flex flex-col justify-center items-center text-center gap-3">
        <MessageSquare size={28} className="text-indigo-400" />
        <p className="text-sm font-semibold">AI Assistant</p>
        <p className="max-w-xs text-xs text-slate-400">Open the AI sidebar and ask it to summarize or update this workspace.</p>
        <pre className="mt-3 max-w-full overflow-x-auto text-[10px] text-slate-500 bg-slate-900 p-2 rounded-2xl">{workspaceNotes || 'No notes available'}</pre>
      </div>
    ),
};

import WorkspaceCursors from './WorkspaceCursors';

export default function WorkspaceCanvas({ layout, onLayoutChange, onRemoveBlock, onDetachBlock, onDuplicateBlock, roadmap, session, onConfigChange, workspaceNotes, presence, onCursorMove, onVerify }) {
    const handleMouseMove = (e) => {
        if (!roadmap?.id || !onCursorMove) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        onCursorMove({ x, y });
    };

    const renderBlock = (item) => {
        const Component = BLOCK_COMPONENTS[item.type];
        if (!Component) return <div className="p-4 bg-red-900/20 text-red-400">Unknown Block</div>;

        return (
            <div className="h-full w-full bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-3xl overflow-hidden shadow-xl group relative">
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <div className="relative group">
                      <button className="p-1.5 bg-gray-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-all">⋯</button>
                      <div className="hidden group-hover:flex absolute right-0 top-10 z-20 flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden w-52">
                        <button onClick={() => onDetachBlock?.(item)} className="text-left px-4 py-3 text-xs text-slate-200 hover:bg-slate-900">🔗 Share as Loop Component</button>
                        <button onClick={() => onDuplicateBlock?.(item)} className="text-left px-4 py-3 text-xs text-slate-200 hover:bg-slate-900">📋 Duplicate Block</button>
                        <button onClick={() => onRemoveBlock(item.i)} className="text-left px-4 py-3 text-xs text-rose-400 hover:bg-slate-900">🗑 Remove Block</button>
                      </div>
                    </div>
                </div>
                <div className="h-full w-full overflow-hidden">
                    <Component
                        roadmap={roadmap}
                        session={session}
                        config={item.config}
                        onConfigChange={(newConfig) => onConfigChange(item.i, newConfig)}
                        workspaceNotes={workspaceNotes}
                        onVerify={onVerify}
                    />
                </div>
            </div>
        );
    };

    return (
        <div
            className="flex-1 overflow-y-auto p-4 bg-gray-950 relative"
            onMouseMove={handleMouseMove}
        >
            <WorkspaceCursors presence={presence || {}} currentUserId={session?.user?.id} />
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                draggableHandle=".drag-handle"
                onLayoutChange={(newLayout) => onLayoutChange(newLayout)}
                margin={[20, 20]}
            >
                {layout.map((item) => (
                    <div key={item.i} data-grid={item}>
                        <div className="h-full w-full p-2">
                            {renderBlock(item)}
                        </div>
                    </div>
                ))}
            </ResponsiveGridLayout>

            {layout.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-700 py-32">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-800 rounded-3xl flex items-center justify-center mb-6">
                        <Plus size={32} className="opacity-20" />
                    </div>
                    <p className="text-lg font-medium">Your workspace is empty</p>
                    <p className="text-sm">Press <kbd className="px-2 py-1 bg-gray-900 rounded border border-gray-800 text-gray-500">/</kbd> or click the button below to add blocks</p>
                </div>
            )}
        </div>
    );
}

function Plus({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
