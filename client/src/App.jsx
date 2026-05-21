import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabaseClient.js';
import UploadForm from './components/UploadForm.jsx';
import SkillTree from './components/SkillTree.jsx';
import QuizPanel from './components/QuizPanel.jsx';
import StellarModal from './components/StellarModal.jsx';
import NodeCard from './components/NodeCard.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import useRoadmap from './hooks/useRoadmap.js';
import useQuiz from './hooks/useQuiz.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function App() {
  const [session, setSession] = useState(null);
  const [authError, setAuthError] = useState('');
  const [txHash, setTxHash] = useState('');
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
  } = useRoadmap();
  const { answer, setAnswer, feedback, loading: quizLoading, submitAnswer, clearFeedback } = useQuiz();

  const activeNode = useMemo(() => nodes.find((node) => node.status !== 'completed') || nodes[0], [nodes]);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setSelectedRoadmap(null);
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, [setSelectedRoadmap]);

  useEffect(() => {
    if (session?.access_token) {
      loadRoadmaps(session.access_token);
    }
  }, [session, loadRoadmaps]);

  const handleSignIn = async (email, password) => {
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (data?.session) {
      setSession(data.session);
      setAuthError('');
    }
  };

  const handleSignUp = async (email, password) => {
    setAuthError('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (data?.session) {
      setSession(data.session);
    } else {
      setAuthError('Check your email to confirm the new account.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setSelectedRoadmap(null);
    setMessage('');
  };

  const handleRoadmapGenerated = async (roadmap) => {
    setSelectedRoadmap(roadmap);
    if (session?.access_token) {
      await loadRoadmap(roadmap.id, session.access_token);
    }
  };

  const handleSelectRoadmap = async (roadmap) => {
    setSelectedRoadmap(roadmap);
    clearFeedback();
    if (session?.access_token) {
      await loadRoadmap(roadmap.id, session.access_token);
    }
  };

  const handleVerify = async (node) => {
    if (!session?.access_token) {
      setMessage('Sign in to verify answers.');
      return;
    }

    const { score, feedback: result } = await submitAnswer({
      nodeId: node.id,
      userAnswer: answer,
      expectedSummary: node.summary,
      roadmapId: selectedRoadmap.id,
      token: session.access_token,
    });

    setMessage(`Score: ${Math.round(score * 100)}%`);
    setAnswer('');
    setTimeout(() => clearFeedback(), 8000);
    if (selectedRoadmap?.id) {
      await loadRoadmap(selectedRoadmap.id, session.access_token);
    }
  };

  const handleMint = async () => {
    if (!selectedRoadmap?.id || !session?.access_token) {
      return;
    }
    const walletSecret = window.prompt('Enter your Stellar testnet secret key:');
    if (!walletSecret) return;

    try {
      const result = await fetch(`${API_URL}/api/roadmap/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ roadmapId: selectedRoadmap.id, walletSecret }),
      });
      const data = await result.json();
      if (data?.txHash) {
        setTxHash(data.txHash);
        setMessage('Credential receipt anchored to Stellar testnet.');
      } else {
        setMessage(data?.error || 'Unable to mint credential.');
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="mx-auto max-w-3xl p-4">
          <AuthPanel onSignIn={handleSignIn} onSignUp={handleSignUp} authError={authError} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <section className="app-card-strong">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/70">Pulse Learn</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">A cleaner way to learn and retain.</h1>
                  <p className="mt-3 text-slate-400">Create personalized learning roadmaps, practice active recall, and verify completion with on-chain receipts.</p>
                </div>
                <button onClick={handleSignOut} className="btn-secondary">Sign out</button>
              </div>
            </section>

            <UploadForm onRoadmapGenerated={handleRoadmapGenerated} token={session.access_token} />

            <section className="app-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">Your roadmaps</h2>
                  <p className="mt-1 text-sm text-slate-400">Manage created roadmaps and open one to practice.</p>
                </div>
                <button onClick={() => loadRoadmaps(session.access_token)} className="btn-secondary">Refresh</button>
              </div>
              <div className="mt-5 space-y-3">
                {loading && <p className="text-sm text-slate-400">Loading roadmaps…</p>}
                {!loading && roadmaps.length === 0 && <p className="text-sm text-slate-400">No roadmaps yet. Upload a syllabus to begin.</p>}
                {roadmaps.map((roadmap) => (
                  <button
                    key={roadmap.id}
                    onClick={() => handleSelectRoadmap(roadmap)}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition ${selectedRoadmap?.id === roadmap.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950/80 hover:border-slate-600'}`}
                  >
                    <p className="font-semibold text-slate-100">{roadmap.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{roadmap.time_budget_hours} hours • created {new Date(roadmap.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="app-card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-100">Roadmap details</h2>
                  <p className="mt-2 text-slate-400">Select a roadmap to review nodes and complete active recall checks.</p>
                </div>
                {selectedRoadmap && (
                  <button onClick={handleMint} className="btn-primary">Mint completion receipt</button>
                )}
              </div>
              {message ? <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200">{message}</div> : null}
            </section>

            {selectedRoadmap ? (
              <>
                <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                  <div className="space-y-6">
                    <section className="app-card">
                      <h3 className="text-lg font-semibold text-slate-100">Selected roadmap</h3>
                      <p className="mt-3 text-slate-400">{selectedRoadmap.title}</p>
                      <p className="mt-2 text-sm text-slate-500">{selectedRoadmap.time_budget_hours} hours total</p>
                    </section>

                    <SkillTree nodes={nodes} selectedNodeId={activeNode?.id} />
                  </div>

                  <div className="space-y-6">
                    {nodes.length ? (
                      <QuizPanel
                        node={activeNode}
                        answer={answer}
                        setAnswer={setAnswer}
                        onSubmit={() => activeNode && handleVerify(activeNode)}
                        feedback={feedback}
                        loading={quizLoading}
                      />
                    ) : (
                      <section className="app-card">
                        <p className="text-slate-400">No nodes available yet for this roadmap.</p>
                      </section>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {nodes.map((node) => (
                    <NodeCard key={node.id} title={node.title} summary={node.summary} status={node.status} />
                  ))}
                </div>
              </>
            ) : (
              <section className="app-card">
                <p className="text-slate-400">Select or create a roadmap to begin your learning journey.</p>
              </section>
            )}
          </div>
        </div>
      </div>

      <StellarModal
        txHash={txHash}
        roadmapTitle={selectedRoadmap?.title}
        onClose={() => setTxHash('')}
      />
    </div>
  );
}
