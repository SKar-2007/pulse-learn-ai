import { useEffect, useState } from 'react';
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

  const handleRoadmapCreated = async (roadmap) => {
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
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-900/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-indigo-300">Pulse Learn AI</h1>
                <p className="mt-2 text-slate-400">Build learning roadmaps, answer active recall quizzes, and anchor completion receipts.</p>
              </div>
              <button onClick={handleSignOut} className="rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500">
                Sign out
              </button>
            </div>
          </div>

          <UploadForm onCreated={handleRoadmapCreated} token={session.access_token} />

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-100">Your roadmaps</h2>
              <button onClick={() => loadRoadmaps(session.access_token)} className="rounded-full border border-slate-700 bg-slate-950/75 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500">
                Refresh
              </button>
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
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-900/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">Roadmap details</h2>
                <p className="mt-2 text-slate-400">Select a roadmap to review nodes and complete active recall checks.</p>
              </div>
              {selectedRoadmap && (
                <button onClick={handleMint} className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                  Mint completion receipt
                </button>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-400">{message}</p>
          </div>

          {selectedRoadmap ? (
            <>
              <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
                    <h3 className="text-lg font-semibold text-slate-100">Selected roadmap</h3>
                    <p className="mt-3 text-slate-400">{selectedRoadmap.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{selectedRoadmap.time_budget_hours} hours total</p>
                  </div>

                  <SkillTree nodes={nodes} selectedNodeId={nodes[0]?.id} />
                </div>

                <div className="space-y-6">
                  {nodes.length ? (
                    <QuizPanel
                      node={nodes.find((node) => node.status !== 'completed') || nodes[0]}
                      answer={answer}
                      setAnswer={setAnswer}
                      onSubmit={() => handleVerify(nodes.find((node) => node.status !== 'completed') || nodes[0])}
                      feedback={feedback}
                      loading={quizLoading}
                    />
                  ) : (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
                      <p className="text-slate-400">No nodes available yet for this roadmap.</p>
                    </div>
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
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
              <p className="text-slate-400">Select or create a roadmap to begin your learning journey.</p>
            </div>
          )}
        </div>
      </div>

      <StellarModal txHash={txHash} />
    </div>
  );
}
