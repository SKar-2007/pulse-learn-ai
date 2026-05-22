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
import useMCPBridge from '../hooks/useMCPBridge';
import { apiUrl, authHeaders } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from '../lib/automationTriggers';

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
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workspaceTitle, setWorkspaceTitle] = useState('');
  const [workspaceTimeBudget, setWorkspaceTimeBudget] = useState('');
  const [workspaceTargetDate, setWorkspaceTargetDate] = useState('');
  const [settingsStatus, setSettingsStatus] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [currentInviteEmail, setCurrentInviteEmail] = useState('');
  const [currentInviteRole, setCurrentInviteRole] = useState(ROLE_OPTIONS[1]);
  const [openCommentNodeId, setOpenCommentNodeId] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [nodeComments, setNodeComments] = useState({});
  const [searchOverlayQuery, setSearchOverlayQuery] = useState('');
  const [mcpService, setMcpService] = useState('slack');
  const [mcpToken, setMcpToken] = useState('');
  const [mcpRepo, setMcpRepo] = useState('');
  const [mcpChannel, setMcpChannel] = useState('#general');
  const [mcpStatus, setMcpStatus] = useState('');
  const [mcpActionLoading, setMcpActionLoading] = useState(false);
  const [automationTrigger, setAutomationTrigger] = useState('node_completed');
  const [automationAction, setAutomationAction] = useState('post_slack');
  const [automationConfig, setAutomationConfig] = useState({ channel: '#general', message_template: 'I completed {{node_title}}.' });
  const [automationRules, setAutomationRules] = useState([]);
  const [automationStatus, setAutomationStatus] = useState('');
  const [automationLoading, setAutomationLoading] = useState(false);

  const fileInputRef = useRef(null);

  const { connections: mcpConnections, loading: mcpLoading, saveConnection, removeConnection } = useMCPBridge(selectedRoadmapId, session);

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
    if (selectedRoadmap) {
      setWorkspaceTitle(selectedRoadmap.title || '');
      setWorkspaceTimeBudget(String(selectedRoadmap.time_budget_hours || ''));
      setWorkspaceTargetDate(selectedRoadmap.target_date ? selectedRoadmap.target_date.split('T')[0] : '');
    }
  }, [selectedRoadmap?.id]);

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

  const addMcpConnection = async () => {
    if (!selectedRoadmap?.id) {
      setMcpStatus('Select a roadmap first.');
      return;
    }
    if (!mcpToken.trim()) {
      setMcpStatus('Enter the plugin access token.');
      return;
    }

    setMcpActionLoading(true);
    setMcpStatus(`Connecting ${mcpService}...`);

    try {
      const connectionConfig = mcpService === 'slack'
        ? { bot_token: mcpToken.trim() }
        : { access_token: mcpToken.trim() };

      await saveConnection(mcpService, connectionConfig);
      setMcpStatus(`${mcpService} connected.`);
      setMcpToken('');
    } catch (err) {
      console.error(err);
      setMcpStatus(err?.response?.data?.error || err.message || 'Connection failed.');
    } finally {
      setMcpActionLoading(false);
    }
  };

  const testMcpPlugin = async (connection) => {
    if (!selectedRoadmap?.id) return;
    setMcpActionLoading(true);
    setMcpStatus(`Testing ${connection.service}...`);

    if (connection.service === 'github' && !mcpRepo.trim()) {
      setMcpStatus('Enter a GitHub repo in owner/repo format.');
      setMcpActionLoading(false);
      return;
    }

    try {
      const payload = connection.service === 'slack'
        ? {
            channel: mcpChannel || '#general',
            message_template: `Pulse-Learn test message for roadmap ${selectedRoadmap.title}`,
          }
        : connection.service === 'github'
          ? {
              repo: mcpRepo.trim(),
              title_template: `Pulse-Learn test issue: ${selectedRoadmap.title}`,
              message_template: 'This is a test issue created from Pulse-Learn.',
            }
          : {};

      const actionType = connection.service === 'slack' ? 'post_slack' : 'create_github_issue';
      const { data } = await axios.post(
        apiUrl(`/api/mcp/${selectedRoadmap.id}/action`),
        {
          service: connection.service,
          action_type: actionType,
          payload,
        },
        { headers }
      );

      setMcpStatus(`Plugin test result: ${JSON.stringify(data.result || data)}`);
    } catch (err) {
      console.error(err);
      setMcpStatus(err?.response?.data?.error || err.message || 'Plugin test failed.');
    } finally {
      setMcpActionLoading(false);
    }
  };

  const fetchAutomationRules = async () => {
    if (!selectedRoadmap?.id) return;
    setAutomationLoading(true);
    try {
      const { data } = await axios.get(apiUrl(`/api/automation/${selectedRoadmap.id}`), { headers });
      setAutomationRules(data.rules || []);
    } catch (err) {
      console.error(err);
      setAutomationStatus('Unable to load automation rules.');
    } finally {
      setAutomationLoading(false);
    }
  };

  const createAutomationRule = async () => {
    if (!selectedRoadmap?.id) {
      setAutomationStatus('Select a roadmap first.');
      return;
    }
    if (!automationAction) {
      setAutomationStatus('Pick an automation action.');
      return;
    }

    setAutomationLoading(true);
    setAutomationStatus(`Saving automation rule...`);

    try {
      const config = { ...automationConfig };
      const { data } = await axios.post(
        apiUrl(`/api/automation/${selectedRoadmap.id}`),
        {
          trigger_type: automationTrigger,
          action_type: automationAction,
          action_config: config,
        },
        { headers }
      );
      setAutomationRules((prev) => [data.rule, ...prev]);
      setAutomationStatus('Automation rule created.');
    } catch (err) {
      console.error(err);
      setAutomationStatus(err?.response?.data?.error || 'Could not save automation rule.');
    } finally {
      setAutomationLoading(false);
    }
  };

  const removeAutomationRule = async (ruleId) => {
    setAutomationLoading(true);
    try {
      await axios.delete(apiUrl(`/api/automation/${ruleId}`), { headers });
      setAutomationRules((prev) => prev.filter((rule) => rule.id !== ruleId));
      setAutomationStatus('Automation rule removed.');
    } catch (err) {
      console.error(err);
      setAutomationStatus(err?.response?.data?.error || 'Could not remove automation rule.');
    } finally {
      setAutomationLoading(false);
    }
  };

  const triggerAutomation = async () => {
    if (!selectedRoadmap?.id) return;
    setAutomationLoading(true);
    setAutomationStatus('Triggering automation...');
    try {
      const triggerData = {
        user: profile?.display_name || session?.user?.email || 'User',
        node_title: selectedRoadmap.title || 'roadmap',
      };
      const { data } = await axios.post(
        apiUrl('/api/automation/trigger'),
        {
          roadmap_id: selectedRoadmap.id,
          trigger_type: automationTrigger,
          trigger_data: triggerData,
        },
        { headers }
      );
      setAutomationStatus(`Triggered ${data.triggered || 0} rules.`);
    } catch (err) {
      console.error(err);
      setAutomationStatus(err?.response?.data?.error || 'Trigger request failed.');
    } finally {
      setAutomationLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
    fetchAutomationRules();
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
  const collaboratorCursors = useMemo(
    () => activeCursors.filter((entry) => entry.user_id !== userId),
    [activeCursors, userId]
  );

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
    setConnectionsOpen(false);
  };

  const toggleConnections = () => {
    setConnectionsOpen((open) => !open);
    setAssistantOpen(false);
    setCollabPanelOpen(false);
    setSettingsOpen(false);
  };

  const toggleSettings = () => {
    setSettingsOpen((open) => !open);
    setAssistantOpen(false);
    setCollabPanelOpen(false);
    setConnectionsOpen(false);
  };

  const toggleTheme = () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('pulse_theme', nextTheme);
  };

  const saveWorkspaceSettings = async () => {
    if (!selectedRoadmap?.id) {
      setSettingsStatus('Select a roadmap first.');
      return;
    }
    if (!workspaceTitle.trim()) {
      setSettingsStatus('Workspace title is required.');
      return;
    }

    setSettingsLoading(true);
    setSettingsStatus('Saving workspace settings...');

    try {
      const payload = {
        title: workspaceTitle.trim(),
        timeBudgetHours: Number(workspaceTimeBudget) || null,
        targetDate: workspaceTargetDate || null,
      };

      const { data } = await axios.patch(apiUrl(`/api/roadmap/${selectedRoadmap.id}`), payload, { headers });
      setSettingsStatus('Workspace settings saved.');
      setRoadmaps((prev) => prev.map((roadmap) => (roadmap.id === data.roadmap.id ? { ...roadmap, ...data.roadmap } : roadmap)));
      setSelectedRoadmapId(data.roadmap.id);
    } catch (err) {
      console.error(err);
      setSettingsStatus(err?.response?.data?.error || 'Unable to save workspace settings.');
    } finally {
      setSettingsLoading(false);
    }
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

        <main className="flex-1 overflow-auto p-8 relative" onPointerMove={handleWorkspacePointer}>
          <div className="pointer-overlay">
            {collaboratorCursors.map((cursor) => (
              <div
                key={cursor.user_id}
                className="realtime-cursor"
                style={{ left: `${cursor.cursor.x}px`, top: `${cursor.cursor.y}px` }}
                title={`${cursor.name} · ${cursor.role}`}
              >
                <span>{cursor.initials}</span>
              </div>
            ))}
          </div>
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
                <button type="button" className="btn-ghost" onClick={toggleSettings}>
                  <Lock size={16} /> Settings
                </button>
                <button type="button" className="btn-ghost" onClick={() => setStatus('Workspace synced.')}>Recap</button>
                <button type="button" className="btn-ghost">
                  <Share2 size={16} /> Share
                </button>
                <button type="button" className="btn-ghost" onClick={toggleConnections}>
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

            {selectedRoadmap && (
              <section className="block">
                <div className="block-header">
                  <div>
                    <p className="block-title">Plugin integrations</p>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">MCP plugin connections</h2>
                  </div>
                  <button type="button" className="btn-ghost text-xs uppercase tracking-[0.35em]" onClick={() => setMcpStatus('')}>
                    Clear status
                  </button>
                </div>
                <div className="block-body">
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                    <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Connected plugins</p>
                      {mcpConnections.length ? (
                        <div className="space-y-3 mt-4">
                          {mcpConnections.map((connection) => (
                            <div key={connection.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-[var(--text-primary)]">{connection.service}</p>
                                  <p className="text-sm text-[var(--text-secondary)]">Connected to this roadmap.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    className="btn-secondary text-xs"
                                    onClick={() => testMcpPlugin(connection)}
                                    disabled={mcpActionLoading}
                                  >
                                    Test
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-ghost text-xs"
                                    onClick={() => removeConnection(connection.id)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              {connection.connection_config && (
                                <pre className="mt-3 overflow-x-auto rounded-[14px] border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-xs text-[var(--text-secondary)]">
                                  {JSON.stringify(connection.connection_config, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-[var(--text-secondary)]">No MCP plugins connected yet. Connect Slack or GitHub to enable automation actions.</p>
                      )}
                    </div>

                    <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Connect plugin</p>
                      <div className="mt-4 grid gap-3">
                        <select value={mcpService} onChange={(event) => setMcpService(event.target.value)} className="input-minimal">
                          <option value="slack">Slack</option>
                          <option value="github">GitHub</option>
                        </select>
                        <input
                          type="text"
                          className="input-minimal"
                          value={mcpToken}
                          onChange={(event) => setMcpToken(event.target.value)}
                          placeholder="Access token"
                        />
                        {mcpService === 'slack' && (
                          <input
                            type="text"
                            className="input-minimal"
                            value={mcpChannel}
                            onChange={(event) => setMcpChannel(event.target.value)}
                            placeholder="Default Slack channel (#general)"
                          />
                        )}
                        {mcpService === 'github' && (
                          <input
                            type="text"
                            className="input-minimal"
                            value={mcpRepo}
                            onChange={(event) => setMcpRepo(event.target.value)}
                            placeholder="GitHub repo (owner/repo)"
                          />
                        )}
                        <button type="button" className="btn-primary" onClick={addMcpConnection} disabled={mcpActionLoading}>
                          Connect {mcpService}
                        </button>
                        {mcpStatus && <p className="text-sm text-[var(--text-secondary)]">{mcpStatus}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="block">
                <div className="block-header">
                  <div>
                    <p className="block-title">Automation rules</p>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Trigger actions from roadmap events</h2>
                  </div>
                  <button type="button" className="btn-ghost text-xs uppercase tracking-[0.35em]" onClick={() => setAutomationStatus('')}>
                    Clear status
                  </button>
                </div>
                <div className="block-body">
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                    <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Existing rules</p>
                      {automationRules.length ? (
                        <div className="space-y-3 mt-4">
                          {automationRules.map((rule) => (
                            <div key={rule.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-[var(--text-primary)]">{AUTOMATION_TRIGGERS[rule.trigger_type]?.label || rule.trigger_type}</p>
                                  <p className="text-sm text-[var(--text-secondary)]">then {AUTOMATION_ACTIONS[rule.action_type]?.label || rule.action_type}</p>
                                </div>
                                <button
                                  type="button"
                                  className="btn-ghost text-xs"
                                  onClick={() => removeAutomationRule(rule.id)}
                                >
                                  Remove
                                </button>
                              </div>
                              {rule.action_config && (
                                <pre className="mt-3 overflow-x-auto rounded-[14px] border border-[var(--border)] bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-secondary)]">
                                  {JSON.stringify(rule.action_config, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-[var(--text-secondary)]">No automation rules yet. Create one to act when a node completes, a roadmap finishes, or a collaborator joins.</p>
                      )}
                    </div>

                    <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">New automation rule</p>
                      <div className="mt-4 grid gap-3">
                        <label className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Trigger</label>
                        <select value={automationTrigger} onChange={(event) => setAutomationTrigger(event.target.value)} className="input-minimal">
                          {Object.entries(AUTOMATION_TRIGGERS).map(([key, trigger]) => (
                            <option key={key} value={key}>{trigger.label}</option>
                          ))}
                        </select>

                        <label className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Action</label>
                        <select value={automationAction} onChange={(event) => {
                          const nextAction = event.target.value;
                          setAutomationAction(nextAction);
                          const defaults = AUTOMATION_ACTIONS[nextAction]?.configFields?.reduce((acc, field) => {
                            acc[field.name] = field.default ?? '';
                            return acc;
                          }, {});
                          setAutomationConfig(defaults);
                        }} className="input-minimal">
                          {Object.entries(AUTOMATION_ACTIONS).map(([key, action]) => (
                            <option key={key} value={key}>{action.label}</option>
                          ))}
                        </select>

                        {AUTOMATION_ACTIONS[automationAction]?.configFields?.map((field) => (
                          <div key={field.name} className="grid gap-2">
                            <label className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">{field.label}</label>
                            {field.type === 'textarea' ? (
                              <textarea
                                rows={3}
                                className="input-minimal resize-none"
                                value={automationConfig[field.name] ?? ''}
                                onChange={(event) => setAutomationConfig((prev) => ({ ...prev, [field.name]: event.target.value }))}
                                placeholder={field.placeholder || ''}
                              />
                            ) : (
                              <input
                                type={field.type}
                                className="input-minimal"
                                value={automationConfig[field.name] ?? ''}
                                onChange={(event) => setAutomationConfig((prev) => ({ ...prev, [field.name]: event.target.value }))}
                                placeholder={field.placeholder || ''}
                              />
                            )}
                          </div>
                        ))}

                        <button type="button" className="btn-primary" onClick={createAutomationRule} disabled={automationLoading}>
                          Save rule
                        </button>
                        <button type="button" className="btn-secondary" onClick={triggerAutomation} disabled={automationLoading || !automationRules.length}>
                          Trigger sample event
                        </button>
                        {automationStatus && <p className="text-sm text-[var(--text-secondary)]">{automationStatus}</p>}
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
              {collaboratorCursors.length > 0 ? (
                <p>{collaboratorCursors.length} collaborator cursor{collaboratorCursors.length > 1 ? 's' : ''} live in the workspace.</p>
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

        {connectionsOpen && (
          <aside className="w-[360px] border-l border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Connections</p>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Workspace plugins</h2>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setConnectionsOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 overflow-auto pr-1">
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Connected services</p>
                {mcpConnections.length ? (
                  <div className="space-y-3 mt-4">
                    {mcpConnections.map((connection) => (
                      <div key={connection.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{connection.service}</p>
                            <p className="text-sm text-[var(--text-secondary)]">Connected to {selectedRoadmap?.title || 'current workspace'}.</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className="btn-secondary text-xs"
                              onClick={() => testMcpPlugin(connection)}
                              disabled={mcpActionLoading}
                            >
                              Test
                            </button>
                            <button
                              type="button"
                              className="btn-ghost text-xs"
                              onClick={() => removeConnection(connection.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[var(--text-secondary)]">No connected services yet. Add Slack or GitHub to automate tasks from this roadmap.</p>
                )}
              </div>

              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Add a new connection</p>
                <div className="mt-4 grid gap-3">
                  <select value={mcpService} onChange={(event) => setMcpService(event.target.value)} className="input-minimal">
                    <option value="slack">Slack</option>
                    <option value="github">GitHub</option>
                  </select>
                  <input
                    type="text"
                    className="input-minimal"
                    value={mcpToken}
                    onChange={(event) => setMcpToken(event.target.value)}
                    placeholder="Access token"
                  />
                  {mcpService === 'slack' && (
                    <input
                      type="text"
                      className="input-minimal"
                      value={mcpChannel}
                      onChange={(event) => setMcpChannel(event.target.value)}
                      placeholder="Default Slack channel (#general)"
                    />
                  )}
                  {mcpService === 'github' && (
                    <input
                      type="text"
                      className="input-minimal"
                      value={mcpRepo}
                      onChange={(event) => setMcpRepo(event.target.value)}
                      placeholder="GitHub repo (owner/repo)"
                    />
                  )}
                  <button type="button" className="btn-primary" onClick={addMcpConnection} disabled={mcpActionLoading}>
                    Connect {mcpService}
                  </button>
                  {mcpStatus && <p className="text-sm text-[var(--text-secondary)]">{mcpStatus}</p>}
                </div>
              </div>
            </div>
          </aside>
        )}

        {settingsOpen && (
          <aside className="w-[360px] border-l border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Settings</p>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Workspace settings</h2>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setSettingsOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 overflow-auto pr-1">
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-faint)]">Current roadmap</p>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">{selectedRoadmap?.title || 'Select a roadmap to configure workspace settings.'}</p>
                <p className="mt-2 text-xs text-[var(--text-faint)]">Owner: {profile.display_name || profile.email}</p>
              </div>

              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <div className="grid gap-3">
                  <label className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-faint)]">Workspace title</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={workspaceTitle}
                    onChange={(event) => setWorkspaceTitle(event.target.value)}
                    placeholder="Roadmap title"
                  />
                  <label className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-faint)]">Time budget (hours)</label>
                  <input
                    type="number"
                    min="1"
                    className="input-minimal"
                    value={workspaceTimeBudget}
                    onChange={(event) => setWorkspaceTimeBudget(event.target.value)}
                    placeholder="Hours"
                  />
                  <label className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-faint)]">Target completion date</label>
                  <input
                    type="date"
                    className="input-minimal"
                    value={workspaceTargetDate}
                    onChange={(event) => setWorkspaceTargetDate(event.target.value)}
                  />
                  <button type="button" className="btn-primary" onClick={saveWorkspaceSettings} disabled={settingsLoading || !selectedRoadmap?.id}>
                    {settingsLoading ? 'Saving…' : 'Save settings'}
                  </button>
                  {settingsStatus && <p className="text-sm text-[var(--text-secondary)]">{settingsStatus}</p>}
                </div>
              </div>
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
