import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LogOut,
  Search,
  ArrowRight,
  Plus,
  Paperclip,
  Share2,
  MoreHorizontal,
  CheckCircle2,
  Zap,
  Lock,
  X,
  ArrowUpRight,
  FileText,
  MessageCircle,
} from 'lucide-react';
import axios from 'axios';
import { useRealtime } from '../hooks/useRealtime';
import { apiUrl, authHeaders } from '../lib/apiClient';

const SUGGESTION_TOPICS = [
  'Docker Mastery',
  'React Hooks',
  'System Design',
  'Machine Learning Fundamentals',
];

const COMMAND_ITEMS = [
  { key: 'upload', label: 'Upload PDF / DOCX / TXT', icon: Paperclip },
  { key: 'url', label: 'Paste a URL', icon: Share2 },
  { key: 'paste', label: 'Paste raw syllabus text', icon: FileText },
  { key: 'block', label: 'Add block to workspace', icon: Plus },
  { key: 'assistant', label: 'Open AI Assistant', icon: Search },
];

const ROLE_OPTIONS = ['Owner', 'Editor', 'Viewer'];

const API_PRESETS = [
  { label: 'Health check', method: 'GET', path: '/api/health', payload: '{}' },
  { label: 'User profile', method: 'GET', path: '/api/user/profile', payload: '{}' },
  { label: 'List roadmaps', method: 'GET', path: '/api/roadmap', payload: '{}' },
  { label: 'AI assistant sample', method: 'POST', path: '/api/ai-assistant', payload: '{"messages":[{"role":"user","content":"Explain spaced repetition in a study plan."}],"pageContext":"","mbtiType":"INTJ"}' },
  { label: 'Search demo', method: 'GET', path: '/api/search?q=linear', payload: '{}' },
];

export default function Dashboard({ session, profile }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [heroInput, setHeroInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [hours, setHours] = useState('5');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('Ready.');
  const [healthStatus, setHealthStatus] = useState('Unknown');
  const [aiInput, setAIInput] = useState('What is the best way to learn this topic?');
  const [aiMessages, setAIMessages] = useState([
    { role: 'assistant', content: 'Enter a question and I will answer it in your learning style.' },
  ]);
  const [aiLoading, setAILoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('linear algebra');
  const [searchResults, setSearchResults] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [collabPanelOpen, setCollabPanelOpen] = useState(false);
  const [currentInviteEmail, setCurrentInviteEmail] = useState('');
  const [currentInviteRole, setCurrentInviteRole] = useState(ROLE_OPTIONS[1]);
  const [openCommentNodeId, setOpenCommentNodeId] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [nodeComments, setNodeComments] = useState({});
  const [searchOverlayQuery, setSearchOverlayQuery] = useState('');

  const fileInputRef = useRef(null);

  const selectedRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === selectedRoadmapId) || roadmaps[0] || null,
    [roadmaps, selectedRoadmapId]
  );

  const userId = session?.user?.id || (session?.access_token === 'demo' ? 'demo-user' : null);

  const handleRealtimeNodeUpdate = useCallback(
    (node) => {
      if (!node?.roadmap_id || node.roadmap_id !== selectedRoadmap?.id) return;
      setRoadmaps((previous) =>
        previous.map((roadmap) => {
          if (roadmap.id !== selectedRoadmap?.id) return roadmap;
          return {
            ...roadmap,
            nodes: roadmap.nodes?.map((existing) => (existing.id === node.id ? { ...existing, ...node } : existing)) || roadmap.nodes,
          };
        })
      );
    },
    [selectedRoadmap?.id]
  );

  const handleRealtimeCommentAdded = useCallback((comment) => {
    if (!comment?.node_id) return;
    setNodeComments((prev) => ({
      ...prev,
      [comment.node_id]: [...(prev[comment.node_id] || []), comment],
    }));
  }, []);

  const { presence, trackCursor } = useRealtime(selectedRoadmap?.id, userId, {
    onNodeUpdate: handleRealtimeNodeUpdate,
    onCommentAdded: handleRealtimeCommentAdded,
  });

  const workspaceCursorRef = useRef(false);
  const handleWorkspacePointer = (event) => {
    if (!trackCursor || workspaceCursorRef.current) return;
    workspaceCursorRef.current = true;
    const pos = { x: event.clientX, y: event.clientY };
    trackCursor(pos).finally(() => {
      window.requestAnimationFrame(() => {
        workspaceCursorRef.current = false;
      });
    });
  };

  useEffect(() => {
    if (!selectedRoadmapId && roadmaps.length) {
      setSelectedRoadmapId(roadmaps[0].id);
    }
  }, [roadmaps, selectedRoadmapId]);

  useEffect(() => {
    fetchRoadmaps();
    checkHealth();

    const handleKeys = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOverlayOpen(true);
      }
      if (event.key === '[') {
        event.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      if (event.key === 'Escape') {
        setCommandOpen(false);
        setSearchOverlayOpen(false);
        setAssistantOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [session]);

  const headers = authHeaders(session?.access_token);

  const fetchCollaborators = async () => {
    if (!selectedRoadmap?.id) return;
    try {
      const { data } = await axios.get(apiUrl(`/api/collab/${selectedRoadmap.id}`), { headers });
      setCollaborators(data.collaborators || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [selectedRoadmap?.id, session?.access_token]);

  const onlinePresence = useMemo(() => {
    return Object.values(presence || {}).map((entry) => {
      const collaborator = collaborators.find((item) => item.users?.id === entry.user_id);
      const name = collaborator?.users?.display_name || `User ${entry.user_id.slice(0, 4)}`;
      const initials = collaborator?.users?.display_name
        ? collaborator.users.display_name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : entry.user_id.slice(0, 2).toUpperCase();
      return {
        ...entry,
        name,
        initials,
        role: collaborator?.role || 'Editor',
      };
    });
  }, [presence, collaborators]);

  const activeCursors = useMemo(() => onlinePresence.filter((item) => item.cursor), [onlinePresence]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(apiUrl('/api/roadmap'), { headers });
      setRoadmaps(data.roadmaps || []);
      setStatus('Roadmaps updated.');
    } catch (err) {
      console.error(err);
      setStatus('Unable to load roadmaps.');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const { data } = await axios.get(apiUrl('/api/health'));
      setHealthStatus(data.status === 'ok' ? `OK (${data.environment || 'dev'})` : 'Unavailable');
    } catch (err) {
      setHealthStatus('Unavailable');
      console.error(err);
    }
  };

  const createRoadmap = async () => {
    if (!heroInput.trim() && !selectedFile) {
      setStatus('Type a topic, paste a syllabus, or upload a file.');
      return;
    }

    setLoading(true);
    setStatus('Generating roadmap…');
    try {
      const formData = new FormData();
      formData.append('title', heroInput.trim().slice(0, 120) || 'New Pulse-Learn roadmap');
      formData.append('timeBudgetHours', Number(hours) || 5);
      formData.append('targetDate', targetDate || '');
      formData.append('workspaceNotes', `Profile: ${profile.mbti_type} / ${profile.study_domain}`);
      if (selectedFile) {
        formData.append('syllabus', selectedFile);
      } else {
        formData.append('text', heroInput.trim());
      }

      const { data } = await axios.post(apiUrl('/api/roadmap/generate'), formData, {
        headers,
      });

      if (data?.roadmap) {
        setRoadmaps([data.roadmap, ...roadmaps.filter((roadmap) => roadmap.id !== data.roadmap.id)]);
        setSelectedRoadmapId(data.roadmap.id);
        setStatus(`Roadmap generated: ${data.roadmap.title}`);
        setHeroInput('');
        setSelectedFile(null);
        setFileName('');
      } else {
        setStatus('Roadmap generation returned no data.');
      }
    } catch (err) {
      console.error(err);
      setStatus(err?.response?.data?.error || 'Roadmap generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const completeRoadmap = async () => {
    if (!selectedRoadmap) {
      setStatus('Select a roadmap first.');
      return;
    }
    setLoading(true);
    setStatus('Completing roadmap…');
    try {
      const { data } = await axios.post(
        apiUrl(`/api/roadmap/${selectedRoadmap.id}/complete`),
        { finalScore: 100 },
        { headers }
      );
      setStatus(data.success ? 'Roadmap completion triggered.' : 'Completion request returned no success flag.');
      if (data.success) {
        await fetchRoadmaps();
      }
    } catch (err) {
      console.error(err);
      setStatus(err?.response?.data?.error || 'Roadmap completion failed.');
    } finally {
      setLoading(false);
    }
  };

  const verifyReceipt = async (txHash) => {
    if (!txHash) {
      setVerificationStatus('No Stellar receipt available.');
      return;
    }
    setVerifying(true);
    setVerificationStatus('Verifying receipt on Stellar…');

    try {
      const { data } = await axios.get(apiUrl(`/api/stellar/verify/${txHash}`), { headers });
      setVerificationStatus(
        data.verified
          ? `Verified on Stellar: ${data.transaction.hash}`
          : 'Receipt exists but could not be verified on Stellar.'
      );
    } catch (err) {
      console.error(err);
      setVerificationStatus(err?.response?.data?.error || 'Stellar verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const sendAssistant = async () => {
    if (!aiInput.trim()) {
      setStatus('Enter a question for the assistant.');
      return;
    }

    const nextMessages = [
      ...aiMessages.filter((msg) => msg.content !== 'Enter a question and I will answer it in your learning style.'),
      { role: 'user', content: aiInput.trim() },
    ];
    setAIMessages(nextMessages);
    setAIInput('');
    setAILoading(true);
    setStatus('Waiting for AI response…');

    try {
      const { data } = await axios.post(
        apiUrl('/api/ai-assistant'),
        {
          messages: nextMessages,
          pageContext: selectedRoadmap?.title || '',
          mbtiType: profile?.mbti_type || 'INTJ',
        },
        { headers }
      );
      setAIMessages([...nextMessages, { role: 'assistant', content: data.reply || 'No reply from AI.' }]);
      setStatus('AI response received.');
    } catch (err) {
      console.error(err);
      setAIMessages([...nextMessages, { role: 'assistant', content: 'AI request failed.' }]);
      setStatus(err?.response?.data?.error || 'AI request failed.');
    } finally {
      setAILoading(false);
    }
  };

  const overlayResults = useMemo(() => {
    const query = searchOverlayQuery.trim().toLowerCase();
    if (!query) return [];

    const roadmapMatches = roadmaps
      .filter((roadmap) => roadmap.title?.toLowerCase().includes(query))
      .map((roadmap) => ({ type: 'Roadmap', label: roadmap.title, action: () => setSelectedRoadmapId(roadmap.id) }));

    const nodeMatches = (selectedRoadmap?.nodes || [])
      .filter((node) => node.title?.toLowerCase().includes(query))
      .map((node) => ({ type: 'Node', label: node.title, action: () => setSelectedRoadmapId(selectedRoadmap.id) }));

    return [...roadmapMatches, ...nodeMatches].slice(0, 8);
  }, [searchOverlayQuery, roadmaps, selectedRoadmap]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setHeroInput(file.name);
      setStatus(`Ready to generate from ${file.name}`);
    }
  };

  const handleCommandAction = (key) => {
    setCommandOpen(false);
    if (key === 'upload') {
      openFilePicker();
      return;
    }
    if (key === 'url') {
      setHeroInput('Paste a URL here to scrape content from a syllabus or document.');
      return;
    }
    if (key === 'paste') {
      setHeroInput('Paste raw syllabus text or a course outline here.');
      return;
    }
    if (key === 'block') {
      setStatus('Block menu is ready. Use the workspace to add structured learning blocks.');
      return;
    }
    if (key === 'assistant') {
      setAssistantOpen(true);
      setCollabPanelOpen(false);
      return;
    }
  };

  const toggleAssistant = () => {
    setAssistantOpen((open) => !open);
    setCollabPanelOpen(false);
  };

  const toggleCollaborators = () => {
    setCollabPanelOpen((open) => !open);
    setAssistantOpen(false);
  };

  const toggleTheme = () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('pulse_theme', nextTheme);
  };

  const sendCollaboratorInvite = async () => {
    if (!currentInviteEmail) {
      setStatus('Enter an email to invite a collaborator.');
      return;
    }
    if (!selectedRoadmap?.id) {
      setStatus('Select a roadmap before inviting collaborators.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        apiUrl('/api/collab/invite'),
        {
          roadmap_id: selectedRoadmap.id,
          invitee_email: currentInviteEmail.trim(),
          role: currentInviteRole.toLowerCase(),
        },
        { headers }
      );
      setStatus(`Invite sent to ${currentInviteEmail}.`);
      setCurrentInviteEmail('');
      await fetchCollaborators();
    } catch (err) {
      console.error(err);
      setStatus(err?.response?.data?.error || 'Invite failed.');
    } finally {
      setLoading(false);
    }
  };

  const assignNode = async (nodeId, userId) => {
    if (!userId) {
      setStatus('Choose a collaborator to assign.');
      return;
    }
    setLoading(true);
    try {
      await axios.patch(
        apiUrl('/api/collab/node/assign'),
        { node_id: nodeId, assigned_to: userId },
        { headers }
      );
      setStatus('Node assigned.');
      await fetchRoadmaps();
    } catch (err) {
      console.error(err);
      setStatus(err?.response?.data?.error || 'Assignment failed.');
    } finally {
      setLoading(false);
    }
  };

  const postNodeComment = async (nodeId) => {
    const content = (commentDrafts[nodeId] || '').trim();
    if (!content) {
      setStatus('Type a comment before posting.');
      return;
    }
    if (!selectedRoadmap?.id) {
      setStatus('Select a roadmap first.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        apiUrl('/api/collab/comment'),
        { node_id: nodeId, content },
        { headers }
      );
      setNodeComments((prev) => ({
        ...prev,
        [nodeId]: [...(prev[nodeId] || []), data.comment],
      }));
      setCommentDrafts((prev) => ({ ...prev, [nodeId]: '' }));
      setStatus('Comment added.');
    } catch (err) {
      console.error(err);
      setStatus(err?.response?.data?.error || 'Comment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">
        <aside className={`transition-all duration-300 ${sidebarOpen ? 'w-[280px] px-6 py-8' : 'w-0 p-0'} overflow-hidden border-r border-[var(--border)] bg-[var(--bg-secondary)]`}>
          <div className="flex h-full flex-col justify-between gap-8">
            <div>
              <div className="flex items-center justify-between gap-3 mb-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-[var(--border)] text-lg font-black">
                  P
                </div>
                <button type="button" className="btn-ghost" onClick={() => setSidebarOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="panel panel-strong p-5">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-faint)]">Pulse Learn</p>
                  <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{profile.study_domain || 'General'}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{profile.mbti_type} · {profile.expertise_level}</p>
                </div>

                <div className="panel p-5">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-faint)]">Workspace actions</p>
                  <div className="mt-4 space-y-3">
                    <button type="button" onClick={() => setSearchOverlayOpen(true)} className="btn-secondary w-full justify-between">
                      Search
                      <span className="text-[var(--text-faint)] text-xs">⌘K</span>
                    </button>
                    <button type="button" onClick={() => setAssistantOpen(true)} className="btn-secondary w-full">
                      AI assistant
                    </button>
                    <button type="button" onClick={fetchRoadmaps} className="btn-secondary w-full">
                      Refresh roadmaps
                    </button>
                  </div>
                </div>

                <div className="panel p-5 space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-faint)]">Roadmaps</p>
                  <div className="space-y-2">
                    {roadmaps.slice(0, 4).map((roadmap) => (
                      <button
                        key={roadmap.id}
                        type="button"
                        onClick={() => setSelectedRoadmapId(roadmap.id)}
                        className={`w-full text-left rounded-[20px] border px-4 py-3 transition ${
                          selectedRoadmap?.id === roadmap.id
                            ? 'border-[var(--text-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)]'
                            : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        <span className="block text-sm font-semibold truncate">{roadmap.title}</span>
                        <span className="block text-xs text-[var(--text-muted)] mt-1">{roadmap.time_budget_hours || '—'}h • {roadmap.target_date ? new Date(roadmap.target_date).toLocaleDateString() : 'No date'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button type="button" onClick={() => supabase.auth.signOut()} className="btn-primary w-full">
                Sign out
              </button>
              <button type="button" className="btn-secondary w-full" onClick={() => setSidebarOpen((prev) => !prev)}>
                {sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-8" onPointerMove={handleWorkspacePointer}>
          <div className="mx-auto max-w-[1480px] space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Pulse-Learn canvas</p>
                <h1 className="text-4xl font-black tracking-tight">Minimal learning workspace</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="btn-ghost" onClick={() => setSearchOverlayOpen(true)}>
                  <Search size={16} /> Search
                </button>
                <button type="button" className="btn-ghost" onClick={() => setAssistantOpen(true)}>
                  AI
                </button>
                <button type="button" className="btn-ghost" onClick={() => setStatus('Workspace synced.')}>Recap</button>
                <button type="button" className="btn-ghost">
                  <Share2 size={16} /> Share
                </button>
                <button type="button" className="btn-ghost">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            <section className="block">
              <div className="block-header">
                <div>
                  <p className="block-title">New session</p>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">What do you want to learn today?</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="btn-ghost" onClick={() => setCommandOpen((prev) => !prev)}>
                    <Plus size={16} />
                  </button>
                  <button type="button" className="btn-primary" onClick={createRoadmap} disabled={loading}>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>

              <div className="block-body">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <input
                      type="text"
                      className="input-minimal"
                      placeholder="Type a topic, paste a syllabus, or drop a file..."
                      value={heroInput}
                      onChange={(event) => setHeroInput(event.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--bg-secondary)] p-3 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                      onClick={openFilePicker}
                    >
                      <Paperclip size={16} />
                    </button>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => setCommandOpen((prev) => !prev)}>
                    + Create command action
                  </button>
                </div>

                {fileName && <p className="text-sm text-[var(--text-secondary)]">Selected file: {fileName}</p>}

                <div className="flex flex-wrap gap-3">
                  {SUGGESTION_TOPICS.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => setHeroInput(suggestion)} className="pill">
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {roadmaps.length === 0 ? (
              <section className="block">
                <div className="block-header">
                  <div>
                    <p className="block-title">First roadmap</p>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Start from a suggested path</h2>
                  </div>
                </div>
                <div className="block-body">
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    Generate a roadmap from scratch and the workspace will build a clean study canvas for you. Keep the experience simple and use the + menu for attachments.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {SUGGESTION_TOPICS.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => setHeroInput(suggestion)} className="pill">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
                <div className="space-y-6">
                  <div className="block">
                    <div className="block-header">
                      <div>
                        <p className="block-title">Roadmap workspace</p>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{selectedRoadmap.title}</h2>
                      </div>
                      <button type="button" onClick={toggleCollaborators} className="presence-stack" title="View collaborators">
                        {(onlinePresence.length ? onlinePresence.slice(0, 3) : collaborators.slice(0, 3)).map((user) => (
                          <div key={user.initials} className="presence-avatar" title={user.name}>
                            {user.initials}
                          </div>
                        ))}
                        <div className="presence-avatar">{(onlinePresence.length ? onlinePresence.length : collaborators.length) > 3 ? `+${(onlinePresence.length ? onlinePresence.length : collaborators.length) - 3}` : '+'}</div>
                      </button>
                    </div>
                    <div className="block-body">
                      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]">{selectedRoadmap.description || 'A clean learning plan is ready for your next session.'}</p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <span className="pill">{selectedRoadmap.total_nodes || 0} nodes</span>
                            <span className="pill">{selectedRoadmap.progress_percent || 0}% complete</span>
                            <span className="pill">{selectedRoadmap.time_budget_hours || 0}h budget</span>
                          </div>
                        </div>
                        <div className="grid gap-3">
                          <button type="button" onClick={() => setSearchOverlayOpen(true)} className="btn-secondary w-full">
                            Search in roadmap
                          </button>
                          <button type="button" onClick={completeRoadmap} className="btn-primary w-full" disabled={loading}>
                            Complete roadmap
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="block">
                    <div className="block-header">
                      <div>
                        <p className="block-title">Skill Tree</p>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Node progression</h2>
                      </div>
                      <button type="button" className="btn-ghost" onClick={() => setCommandOpen(true)}>
                        +
                      </button>
                    </div>
                    <div className="block-body">
                      {(selectedRoadmap?.nodes || []).length > 0 ? (
                        <div className="space-y-3">
                          {selectedRoadmap?.nodes?.map((node) => {
                            const isCompleted = node.status === 'completed';
                            const isActive = node.status === 'unlocked';
                            const isLocked = node.status === 'locked';
                            return (
                              <div
                                key={node.id}
                                className={`rounded-[20px] border p-4 ${
                                  isActive ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]' : 'border-[var(--border)] bg-[var(--bg-primary)]'
                                } ${isLocked ? 'opacity-70' : ''}`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`h-2.5 w-2.5 rounded-full ${isCompleted ? 'bg-[var(--text-primary)]' : isActive ? 'bg-[var(--text-primary)]' : 'border border-[var(--border)] bg-transparent'}`}
                                    />
                                    <div>
                                      <p className={`text-sm ${isCompleted ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                                        {node.title}
                                      </p>
                                      <p className="text-xs text-[var(--text-faint)] mt-1">{node.summary || 'Review the step and continue.'}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                    {isCompleted ? <CheckCircle2 size={16} /> : isActive ? <Zap size={16} /> : <Lock size={16} />}
                                    <span>{node.estimated_minutes || 30}m</span>
                                  </div>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                  <span className="pill text-[11px] uppercase tracking-[0.3em]">
                                    {collaborators.find((user) => user.users?.id === node.assigned_to)?.users?.display_name || 'Unassigned'}
                                  </span>
                                  <select
                                    className="input-minimal rounded-full px-3 py-1 text-xs"
                                    value={node.assigned_to || ''}
                                    onChange={(event) => assignNode(node.id, event.target.value)}
                                  >
                                    <option value="">Assign to</option>
                                    {collaborators.map((user) => (
                                      <option key={user.users?.id} value={user.users?.id}>
                                        {user.users?.display_name} ({user.role})
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    className="btn-ghost rounded-full px-3 py-1 text-xs"
                                    onClick={() => setOpenCommentNodeId(openCommentNodeId === node.id ? null : node.id)}
                                  >
                                    <MessageCircle size={14} className="inline-block mr-1" />
                                    Comments
                                  </button>
                                </div>
                                {openCommentNodeId === node.id && (
                                  <div className="comment-thread mt-3 rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-secondary)]">
                                    {(nodeComments[node.id] || []).map((comment) => (
                                      <div key={comment.id || comment.created_at} className="mb-4 rounded-[18px] border border-[var(--border)] bg-[var(--bg-primary)] p-3">
                                        <div className="comment-row mb-2">
                                          <div>
                                            <p className="font-semibold text-[var(--text-primary)]">{comment.users?.display_name || 'Teammate'}</p>
                                            <p className="text-xs text-[var(--text-faint)]">{new Date(comment.created_at || comment.inserted_at || Date.now()).toLocaleTimeString()}</p>
                                          </div>
                                        </div>
                                        <p className="leading-relaxed text-[var(--text-secondary)]">{comment.content}</p>
                                      </div>
                                    ))}
                                    <div className="grid gap-2">
                                      <textarea
                                        rows={3}
                                        className="input-minimal resize-none"
                                        value={commentDrafts[node.id] || ''}
                                        onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [node.id]: event.target.value }))}
                                        placeholder="Leave a comment for teammates..."
                                      />
                                      <button type="button" className="btn-primary w-full" onClick={() => postNodeComment(node.id)}>
                                        Add comment
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--text-secondary)]">No nodes available. Generate a roadmap to see the skill tree.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="block">
                  <div className="block-header">
                    <div>
                      <p className="block-title">Workspace metadata</p>
                      <h2 className="text-xl font-semibold text-[var(--text-primary)]">Quick status</h2>
                    </div>
                    <button type="button" onClick={toggleTheme} className="btn-ghost text-xs uppercase tracking-[0.35em]">
                      Toggle theme
                    </button>
                  </div>
                  <div className="block-body">
                    <div className="grid gap-3">
                      <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Receipt</p>
                        <p className="mt-3 text-sm text-[var(--text-secondary)]">{selectedRoadmap.stellar_tx_hash || 'Mint after completion'}</p>
                      </div>
                      <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Verification</p>
                        <button type="button" className="btn-secondary mt-3 w-full" onClick={() => verifyReceipt(selectedRoadmap?.stellar_tx_hash)} disabled={!selectedRoadmap?.stellar_tx_hash || verifying}>
                          {verifying ? 'Verifying…' : 'Verify on Stellar'}
                        </button>
                        {verificationStatus && <p className="mt-3 text-xs text-[var(--text-secondary)]">{verificationStatus}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="block">
              <div className="block-body">
                <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Backend status</p>
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">{healthStatus}</p>
                  </div>
                  <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Last update</p>
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">{selectedRoadmap?.updated_at ? new Date(selectedRoadmap.updated_at).toLocaleString() : 'No roadmap selected'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        {assistantOpen && (
          <aside className="w-[340px] border-l border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">AI Assistant</p>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Pulse Companion</h2>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setAssistantOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="flex h-[calc(100vh-220px)] flex-col gap-4 overflow-auto pr-1">
              {aiMessages.map((message, index) => (
                <div key={index} className={`rounded-[20px] border border-[var(--border)] p-4 ${message.role === 'assistant' ? 'bg-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)]'}`}>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-faint)]">{message.role}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{message.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3">
              <input
                type="text"
                className="input-minimal"
                value={aiInput}
                onChange={(event) => setAIInput(event.target.value)}
                placeholder="Ask anything about your roadmap..."
              />
              <button type="button" className="btn-primary w-full" onClick={sendAssistant} disabled={aiLoading}>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </aside>
        )}

        {collabPanelOpen && (
          <aside className="w-[340px] border-l border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Collaboration</p>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Team panel</h2>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setCollabPanelOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4 overflow-auto pr-1">
              {collaborators.length ? (
                collaborators.map((user) => {
                  const online = onlinePresence.some((entry) => entry.user_id === user.users?.id);
                  const displayName = user.users?.display_name || user.users?.email || 'Collaborator';
                  const initials = displayName
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <div key={user.users?.id || displayName} className="collab-person-row">
                      <div className="flex items-center gap-3">
                        <div className="presence-avatar">{initials}</div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{displayName}</p>
                          <p className="text-[var(--text-muted)] text-xs">{user.role} · {online ? 'Online' : 'Away'}</p>
                        </div>
                      </div>
                      <MoreHorizontal size={16} className="text-[var(--text-secondary)]" />
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
                  No collaborators yet. Invite a teammate to start working together.
                </div>
              )}
            </div>
            <div className="mt-4 rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-secondary)]">
              {activeCursors.length > 0 ? (
                <p>{activeCursors.length} collaborator cursor{activeCursors.length > 1 ? 's' : ''} live in the workspace.</p>
              ) : (
                <p>Move your cursor to share live activity with teammates.</p>
              )}
            </div>
            <div className="mt-6 rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Invite collaborator</p>
              <input
                type="email"
                className="input-minimal mt-3"
                value={currentInviteEmail}
                onChange={(event) => setCurrentInviteEmail(event.target.value)}
                placeholder="Enter email address"
              />
              <select
                className="input-minimal mt-3"
                value={currentInviteRole}
                onChange={(event) => setCurrentInviteRole(event.target.value)}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <button type="button" className="btn-primary mt-4 w-full" onClick={sendCollaboratorInvite}>
                Send invite
              </button>
            </div>
          </aside>
        )}

        {searchOverlayOpen && (
          <div className="search-overlay" onClick={() => setSearchOverlayOpen(false)}>
            <div className="search-modal" onClick={(event) => event.stopPropagation()}>
              <div className="search-input-row">
                <Search size={18} className="text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={searchOverlayQuery}
                  onChange={(event) => setSearchOverlayQuery(event.target.value)}
                  placeholder="Search everything..."
                  autoFocus
                />
                <button type="button" className="btn-ghost" onClick={() => setSearchOverlayOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div>
                <p className="search-group-label">Results</p>
                {overlayResults.length > 0 ? (
                  overlayResults.map((result, index) => (
                    <button
                      type="button"
                      key={`${result.label}-${index}`}
                      onClick={() => {
                        result.action();
                        setSearchOverlayOpen(false);
                      }}
                      className="search-result-row"
                    >
                      <div>
                        <p className="text-sm text-[var(--text-primary)]">{result.label}</p>
                        <p className="text-xs text-[var(--text-faint)]">{result.type}</p>
                      </div>
                      <ArrowRight size={16} className="text-[var(--text-faint)]" />
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-5 text-sm text-[var(--text-secondary)]">No matching results yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {commandOpen && (
          <div className="command-menu">
            {COMMAND_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleCommandAction(item.key)}
                  className="command-item w-full text-left"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
