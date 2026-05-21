import { useState, useEffect, useCallback } from 'react';
import { LogOut, LayoutDashboard, BarChart2, Users, Upload, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import UploadForm from './UploadForm';
import SkillTree from './SkillTree';
import QuizPanel from './QuizPanel';
import NodeCard from './NodeCard';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import CollabSidebar from './collab/CollabSidebar';
import { useRealtime } from '../hooks/useRealtime';
import useRoadmap from '../hooks/useRoadmap';
import useQuiz from '../hooks/useQuiz';

export default function Dashboard({ session, profile }) {
    const [activeTab, setActiveTab] = useState('roadmap');
    const {
        roadmaps,
        selectedRoadmap,
        nodes,
        loading,
        message,
        setMessage,
        loadRoadmaps,
        loadRoadmap,
        setSelectedRoadmap,
        setNodes,
    } = useRoadmap();

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

    useRealtime(selectedRoadmap?.id, {
        onNodeUpdate: handleNodeUpdate,
        onCommentAdded: (comment) => console.log('New comment:', comment),
    });

    const handleSelectRoadmap = async (roadmap) => {
        setSelectedRoadmap(roadmap);
        clearFeedback();
        if (session?.access_token) {
            await loadRoadmap(roadmap.id, session.access_token);
        }
    };

    const activeNode = nodes.find((node) => node.status !== 'completed') || nodes[0];

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex">
            {/* Sidebar Navigation */}
            <div className="w-20 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-8 gap-8">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">P</div>

                <nav className="flex flex-col gap-4 flex-1">
                    <NavIcon
                        icon={<LayoutDashboard size={20} />}
                        active={activeTab === 'roadmap'}
                        onClick={() => setActiveTab('roadmap')}
                        label="Roadmap"
                    />
                    <NavIcon
                        icon={<BarChart2 size={20} />}
                        active={activeTab === 'analytics'}
                        onClick={() => setActiveTab('analytics')}
                        label="Analytics"
                    />
                </nav>

                <button
                    onClick={() => supabase.auth.signOut()}
                    className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-gray-950/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-white capitalize">
                            {activeTab} Dashboard
                        </h1>
                        <p className="text-xs text-gray-500">Welcome back, {profile.expertise_level} learner</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => loadRoadmaps(session.access_token)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">{session.user.email.split('@')[0]}</p>
                                <p className="text-[10px] text-gray-500">{profile.study_domain}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                                {session.user.email[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {activeTab === 'roadmap' ? (
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
                            <div className="space-y-8">
                                {/* Roadmap Selection / List */}
                                {!selectedRoadmap ? (
                                    <div className="space-y-6">
                                        <section className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 text-center max-w-2xl mx-auto">
                                            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <Upload size={32} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white mb-2">Create Your First Roadmap</h2>
                                            <p className="text-gray-400 mb-8 px-8">Upload a syllabus or course material and our AI will build a personalized learning tree for you.</p>
                                            <UploadForm onRoadmapGenerated={loadRoadmaps} token={session.access_token} />
                                        </section>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {roadmaps.map((r) => (
                                                <button
                                                    key={r.id}
                                                    onClick={() => handleSelectRoadmap(r)}
                                                    className="group p-6 bg-gray-900 border border-gray-800 rounded-2xl hover:border-indigo-500/50 transition-all text-left"
                                                >
                                                    <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{r.title}</h3>
                                                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1.5"><RefreshCw size={12} /> {r.time_budget_hours}h</span>
                                                        <span className="flex items-center gap-1.5"><Users size={12} /> {r.is_collaborative ? 'Collaborative' : 'Private'}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Active Roadmap View */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <button
                                                    onClick={() => setSelectedRoadmap(null)}
                                                    className="text-xs text-indigo-400 hover:text-indigo-300 mb-2"
                                                >
                                                    ← Back to all roadmaps
                                                </button>
                                                <h2 className="text-3xl font-bold text-white">{selectedRoadmap.title}</h2>
                                            </div>
                                            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all">
                                                Mint Receipt
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
                                            <div className="space-y-8">
                                                <SkillTree nodes={nodes} selectedNodeId={activeNode?.id} />
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {nodes.map(node => (
                                                        <NodeCard
                                                            key={node.id}
                                                            title={node.title}
                                                            summary={node.summary}
                                                            status={node.status}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {activeNode && (
                                                    <QuizPanel
                                                        node={activeNode}
                                                        answer={answer}
                                                        setAnswer={setAnswer}
                                                        onSubmit={() => submitAnswer({
                                                            nodeId: activeNode.id,
                                                            userAnswer: answer,
                                                            expectedSummary: activeNode.summary,
                                                            roadmapId: selectedRoadmap.id,
                                                            token: session.access_token,
                                                        })}
                                                        feedback={feedback}
                                                        loading={quizLoading}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Collaboration Sidebar */}
                            {selectedRoadmap && (
                                <CollabSidebar roadmapId={selectedRoadmap.id} ownerId={selectedRoadmap.owner_id} />
                            )}
                        </div>
                    ) : (
                        <AnalyticsDashboard />
                    )}
                </main>
            </div>

            {message && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-900/40 font-medium z-50">
                    {message}
                </div>
            )}
        </div>
    );
}

function NavIcon({ icon, active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-xl transition-all relative group ${active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
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
