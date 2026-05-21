import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Brain, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {API_BASE} from '../../../lib/apiClient';

export default function SummaryBlock({ workspaceNotes, session }) {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const generateSummary = async () => {
        if (!workspaceNotes || loading) return;
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_BASE}/api/user/chat`, {
                message: "Based on all the notes in this workspace, generate a concise 'Smart Brief'. Highlight key concepts, cross-relationships, and missing gaps in my understanding. Format it with premium typography.",
                history: [],
                workspaceNotes
            }, { headers: { Authorization: `Bearer ${session.access_token}` } });

            setSummary(data.reply);
        } catch (error) {
            console.error('Summary generation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (workspaceNotes && !summary) {
            generateSummary();
        }
    }, [workspaceNotes]);

    return (
        <div className="h-full w-full p-6 flex flex-col bg-indigo-900/10">
            <div className="flex items-center justify-between mb-6 drag-handle cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Brain size={16} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Smart Summary</h3>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase">Workspace Synthesis</p>
                    </div>
                </div>
                <button
                    onClick={generateSummary}
                    disabled={loading}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all disabled:opacity-30"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                {loading ? (
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-800 rounded-full w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded-full w-1/2 animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded-full w-2/3 animate-pulse" />
                    </div>
                ) : summary ? (
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed font-medium">
                        {summary.split('\n').map((line, i) => (
                            <p key={i} className="mb-2">{line}</p>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                        <MessageSquare size={32} className="mb-4" />
                        <p className="text-xs font-medium">Write some notes to generate a synthesis</p>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-indigo-500/10 flex items-center gap-2">
                <Sparkles size={12} className="text-indigo-400" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Gemini Grounded Intelligence</span>
            </div>
        </div>
    );
}