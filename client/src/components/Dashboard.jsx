import { useState, useEffect, useCallback } from 'react';
import { LogOut, Upload, Users, Sparkles, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import useRoadmap from '../hooks/useRoadmap';
import useWorkspace from '../hooks/useWorkspace';
import useQuiz from '../hooks/useQuiz';
import useAIAssistant from '../hooks/useAIAssistant';
import { useRealtime } from '../hooks/useRealtime';
import WorkspaceCanvas from './workspace/WorkspaceCanvas';
import BlockPalette from './workspace/BlockPalette';
import TemplateGallery from './workspace/TemplateGallery';
import MBTIInsights from './auth/MBTIInsights';
import CollabSidebar from './collab/CollabSidebar';
import PresenceBar from './collab/PresenceBar';
import AICompanion from './workspace/AICompanion';
import GlobalSearch from './search/GlobalSearch';
import PageSidebar from './workspace/PageSidebar';
import StellarModal from './StellarModal';
import UploadForm from './UploadForm';

export default function Dashboard({ session, profile }) {
    const [activeTab, setActiveTab] = useState('roadmap');
    const [toastMessage, setToastMessage] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [stellarTxHash, setStellarTxHash] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);

    const {
        roadmaps,
        selectedRoadmap,
        nodes,
        loading,
        message: roadmapMessage,
        setMessage: setRoadmapMessage,
        loadRoadmaps,
        loadRoadmap,
        setSelectedRoadmap,
        setNodes,
    } = useRoadmap();

    const { layout, setLayout, saveLayout, pages, currentPageId, currentPage, selectPage, createPage, loading: workspaceLoading } = useWorkspace(selectedRoadmap?.id, session, isShared);

    const aggregateNotes = useCallback(() => {
        return layout
            .filter(b => b.type === 'notes' && b.config?.text)
            .map(b => b.config.text)
            .join('\n\n');
    }, [layout]);

    const { messages: aiMessages, loading: aiLoading, sendMessage: sendAIMessage } = useAIAssistant(session, profile, aggregateNotes());

    const { answer, setAnswer, feedback, loading: quizLoading, submitAnswer, clearFeedback } = useQuiz();

    useEffect(() => {
        if (session?.access_token) {
            loadRoadmaps(session.access_token);
        }
    }, [session, loadRoadmaps]);

    const handleNodeUpdate = useCallback((updatedNode) => {
        setNodes(prev =>
            prev.some(n => n.id === updatedNode.id)
                ? prev.map(n => n.id === updatedNode.id ? updatedNode : n)
                : [...prev, updatedNode]
        );
    }, [setNodes]);

    const { presence, trackCursor } = useRealtime(selectedRoadmap?.id, session.user.id, {
        onNodeUpdate: handleNodeUpdate,
        onCommentAdded: (comment) => console.log('New comment:', comment),
    });

    const handleSelectRoadmap = async (roadmap) => {
        setSelectedRoadmap(roadmap);
        clearFeedback();
        setStellarTxHash(null);
        if (session?.access_token) {
            await loadRoadmap(roadmap.id, session.access_token);
        }
    };

    const handleAddBlock = (type) => {
        const newBlock = {
            i: `block-${Date.now()}`,
            x: (layout.length * 4) % 12,
            y: Infinity,
            w: 4,
            h: 4,
            type,
            config: {}
        };
        const newLayout = [...layout, newBlock];
        setLayout(newLayout);
        saveLayout(newLayout);
    };

    const handleRemoveBlock = (id) => {
        const newLayout = layout.filter(b => b.i !== id);
        setLayout(newLayout);
        saveLayout(newLayout);
    };

    const handleDuplicateBlock = (block) => {
        const duplicate = {
            ...block,
            i: `block-${Date.now()}-dup`,
            x: Math.min(block.x + 1, 8),
            y: block.y + 1,
            config: { ...block.config },
        };
        const newLayout = [...layout, duplicate];
        setLayout(newLayout);
        saveLayout(newLayout);
    };

    const handleDetachBlock = async (block) => {
        if (!selectedRoadmap?.id || !session?.access_token) return;
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/loop-component`,
                {
                    roadmap_id: selectedRoadmap.id,
                    block_type: block.type,
                    block_config: block.config,
                    title: `${block.type} component`,
                    share_scope: isShared ? 'team' : 'private',
                },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );

            const shareLink = `${window.location.origin}/shared/${data.component.share_token}`;
            window.navigator.clipboard?.writeText(shareLink);
            setToastMessage('Loop component link copied to clipboard!');
            setTimeout(() => setToastMessage(''), 4000);
        } catch (err) {
            console.error('Failed to share loop component:', err);
            setToastMessage('Unable to share this block as a Loop Component.');
            setTimeout(() => setToastMessage(''), 4000);
        }
    };

    const handleNewPage = async () => {
        const page = await createPage('New Workspace Page');
        if (page) selectPage(page.id);
    };

    const handleNewSubpage = async () => {
        if (!currentPageId) return;
        const page = await createPage('New Subpage', currentPageId);
        if (page) selectPage(page.id);
    };

    const handleLayoutChange = (newLayout) => {
        const merged = newLayout.map(item => {
            const original = layout.find(b => b.i === item.i);
            return { ...item, type: original?.type, config: original?.config };
        });
        setLayout(merged);
        saveLayout(merged);
    };

    const handleConfigChange = (blockId, newConfig) => {
        const newLayout = layout.map(b =>
            b.i === blockId ? { ...b, config: { ...b.config, ...newConfig } } : b
        );
        setLayout(newLayout);
        // We might want to debounce saveLayout here for high-frequency updates like typing
        saveLayout(newLayout);
    };

    const handleMint = async () => {
        setToastMessage('Minting credential on Stellar...');
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/roadmap/${selectedRoadmap.id}/complete`,
                { finalScore: nodes.length ? (nodes.filter(n => n.status === 'completed').length / nodes.length) * 100 : 100 },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            setStellarTxHash(data.stellar_tx_hash);
            setToastMessage('Credential minted successfully!');
        } catch (err) {
            console.error('Minting failed:', err);
            setToastMessage('Minting failed. Please try again.');
        } finally {
            setTimeout(() => setToastMessage(''), 3000);
        }
    };

    const onQuizVerify = (result) => {
        if (result.passed) {
            const otherNodes = nodes.filter(n => n.id !== result.node.id && n.remediation_depth === 0);
            const allDone = otherNodes.every(n => n.status === 'completed');
            if (allDone) {
                setShowConfetti(true);
                handleMint();
            }
        }
    };
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex relative font-sans">
            {showConfetti && <ReactConfetti numberOfPieces={200} recycle={false} gravity={0.1} />}

            {/* Profile Overlay */}
            <AnimatePresence>
                {showProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowProfile(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative z-10 w-full max-w-xl"
                        >
                            <MBTIInsights profile={profile} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sidebar Navigation */}
            <div className="w-20 bg-gray-900/80 border-r border-gray-800 flex flex-col items-center py-8 gap-8 backdrop-blur-xl z-30">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/20">P</div>

                <nav className="flex flex-col gap-6 flex-1 mt-8">
                    {roadmaps.map(r => (
                        <button
                            key={r.id}
                            onClick={() => handleSelectRoadmap(r)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedRoadmap?.id === r.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
                            title={r.title}
                        >
                            {r.title[0].toUpperCase()}
                        </button>
                    ))}
                    <button
                        onClick={() => setActiveTab('upload')}
                        className="w-12 h-12 border-2 border-dashed border-gray-700 rounded-2xl flex items-center justify-center text-gray-600 hover:border-indigo-500 hover:text-indigo-500 transition-all"
                    >
                        <Upload size={20} />
                    </button>
                </nav>

                <button
                    onClick={() => supabase.auth.signOut()}
                    className="p-3 text-gray-500 hover:text-white hover:bg-red-900/30 rounded-xl transition-all"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-gray-950/50 backdrop-blur-md sticky top-0 z-20">
                    <div
                        onClick={() => setShowProfile(true)}
                        className="cursor-pointer group"
                    >
                        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-4 group-hover:text-indigo-400 transition-colors">
                            {selectedRoadmap ? selectedRoadmap.title : 'Welcome to Pulse-Learn'}
                            {selectedRoadmap && <PresenceBar presence={presence} />}
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 group-hover:text-gray-400 transition-colors">
                            {profile.mbti_type} • {profile.study_domain || 'General'} • {profile.expertise_level} • <span className="text-indigo-500 font-black">View Cognitive Profile</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        {selectedRoadmap && (
                            <>
                                <button
                                    onClick={() => setIsShared(!isShared)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isShared ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
                                >
                                    <Users size={14} />
                                    {isShared ? 'Collaborative' : 'Private'}
                                </button>
                                <button
                                    onClick={() => setShowAI(!showAI)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-bold ${showAI ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-300'}`}
                                    title="AI Companion"
                                >
                                    <Sparkles size={16} className={showAI ? 'animate-pulse' : ''} />
                                    AI Companion
                                </button>
                                <button
                                    onClick={() => setShowTemplates(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border bg-slate-900 border-slate-800 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300 transition-all font-bold"
                                    title="Workspace Templates"
                                >
                                    <Layout size={16} />
                                    Templates
                                </button>
                            </>
                        )}
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                            <div className="text-right">
                                <p className="text-sm font-bold text-white leading-tight">{session.user.email.split('@')[0]}</p>
                                <p className="text-[10px] font-medium text-indigo-400">Learning OS v3.0</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-500/10">
                                {session.user.email[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden relative">
                    {activeTab === 'upload' ? (
                        <div className="p-8 max-w-2xl mx-auto w-full">
                            <UploadForm onComplete={() => setActiveTab('roadmap')} session={session} />
                        </div>
                    ) : (
                        <>
                            {selectedRoadmap && (
                                <PageSidebar
                                    pages={pages}
                                    currentPageId={currentPageId}
                                    onPageSelect={selectPage}
                                    onNewPage={handleNewPage}
                                    onNewSubpage={handleNewSubpage}
                                    onRenamePage={() => null}
                                    onDeletePage={() => null}
                                    onSaveAsTemplate={() => null}
                                />
                            )}
                            <WorkspaceCanvas
                                layout={layout}
                                onLayoutChange={handleLayoutChange}
                                onRemoveBlock={handleRemoveBlock}
                                onDetachBlock={handleDetachBlock}
                                onDuplicateBlock={handleDuplicateBlock}
                                onConfigChange={handleConfigChange}
                                workspaceNotes={aggregateNotes()}
                                roadmap={selectedRoadmap}
                                session={session}
                                presence={presence}
                                onCursorMove={(pos) => trackCursor(pos)}
                            />
                            {selectedRoadmap && <CollabSidebar roadmapId={selectedRoadmap.id} ownerId={selectedRoadmap.owner_id} />}
                            <BlockPalette onSelect={handleAddBlock} />
                        </>
                    )}
                </main>
            </div>

            <StellarModal
                txHash={stellarTxHash}
                roadmapTitle={selectedRoadmap?.title}
                onClose={() => setStellarTxHash(null)}
            />

            {toastMessage && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-2xl z-50 animate-bounce">
                    {toastMessage}
                </div>
            )}

            <AICompanion
                session={session}
                roadmap={selectedRoadmap}
                profile={profile}
                workspaceNotes={aggregateNotes()}
                isOpen={showAI}
                onToggle={() => setShowAI(!showAI)}
                messages={aiMessages}
                onSend={sendAIMessage}
                loading={aiLoading}
            />

            <GlobalSearch session={session} onNavigate={() => null} />

            <TemplateGallery
                isOpen={showTemplates}
                onClose={() => setShowTemplates(false)}
                onApply={(newLayout) => {
                    setLayout(newLayout);
                    // Persist would happen via useEffect in useWorkspace
                }}
            />
        </div>
    );
}

function NavIcon({ icon, active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`p-3 rounded-xl transition-all duration-200 ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-gray-500 hover:text-white hover:bg-gray-800'
                }`}
        >
            {icon}
            <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {label}
            </span>
        </button>
    );
}
