import { useEffect, useMemo, useState } from 'react';
import { LogOut, Search, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { apiUrl, authHeaders } from '../lib/apiClient';

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
  const [topic, setTopic] = useState('');
  const [hours, setHours] = useState('5');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('Ready.');
  const [healthStatus, setHealthStatus] = useState('Unknown');
  const [aiInput, setAIInput] = useState('What is the best way to learn this topic?');
  const [aiMessages, setAIMessages] = useState([{ role: 'assistant', content: 'Enter a question and I will answer it in your learning style.' }]);
  const [aiLoading, setAILoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('linear algebra');
  const [searchResults, setSearchResults] = useState(null);
  const [endpointMethod, setEndpointMethod] = useState('GET');
  const [endpointPath, setEndpointPath] = useState('/api/health');
  const [endpointPayload, setEndpointPayload] = useState('{}');
  const [endpointResult, setEndpointResult] = useState('No response yet.');
  const [loading, setLoading] = useState(false);

  const selectedRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === selectedRoadmapId) || roadmaps[0] || null,
    [roadmaps, selectedRoadmapId]
  );

  useEffect(() => {
    if (!selectedRoadmapId && roadmaps.length) {
      setSelectedRoadmapId(roadmaps[0].id);
    }
  }, [roadmaps, selectedRoadmapId]);

  useEffect(() => {
    fetchRoadmaps();
    checkHealth();
  }, [session]);

  const headers = authHeaders(session?.access_token);

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
    if (!topic.trim()) {
      setStatus('Enter a topic or syllabus to generate a roadmap.');
      return;
    }

    setLoading(true);
    setStatus('Generating roadmap…');
    try {
      const { data } = await axios.post(
        apiUrl('/api/roadmap/generate'),
        {
          title: topic.trim().slice(0, 120),
          timeBudgetHours: Number(hours) || 5,
          targetDate: targetDate || null,
          text: topic.trim(),
          workspaceNotes: `Profile: ${profile.mbti_type} / ${profile.study_domain}`,
        },
        { headers }
      );

      if (data?.roadmap) {
        setRoadmaps([data.roadmap, ...roadmaps.filter((roadmap) => roadmap.id !== data.roadmap.id)]);
        setSelectedRoadmapId(data.roadmap.id);
        setStatus(`Roadmap generated: ${data.roadmap.title}`);
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
    } catch (err) {
      console.error(err);
      setStatus(err?.response?.data?.error || 'Roadmap completion failed.');
    } finally {
      setLoading(false);
    }
  };

  const sendAssistant = async () => {
    if (!aiInput.trim()) {
      setStatus('Enter a question for the assistant.');
      return;
    }

    const nextMessages = [...aiMessages.filter((msg) => msg.content !== 'Enter a question and I will answer it in your learning style.'), { role: 'user', content: aiInput.trim() }];
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

  const runSearch = async () => {
    if (!searchQuery.trim()) {
      setStatus('Enter a search query.');
      return;
    }

    setLoading(true);
    setStatus('Searching…');
    try {
      const { data } = await axios.get(apiUrl('/api/search'), {
        headers,
        params: { q: searchQuery.trim() },
      });
      setSearchResults(data.results || {});
      setStatus('Search complete.');
    } catch (err) {
      console.error(err);
      setSearchResults(null);
      setStatus(err?.response?.data?.error || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const runEndpoint = async (method, path, payload) => {
    const normalizedPath = path.startsWith('/api') ? path : `/api${path}`;
    setLoading(true);
    setStatus(`Calling ${method} ${normalizedPath}`);
    try {
      const requestConfig = {
        method: method.toLowerCase(),
        url: apiUrl(normalizedPath),
        headers: { ...headers, 'Content-Type': 'application/json' },
      };
      if (method !== 'GET' && payload.trim()) {
        requestConfig.data = JSON.parse(payload);
      }
      const { data } = await axios(requestConfig);
      setEndpointResult(JSON.stringify(data, null, 2));
      setStatus(`${method} ${normalizedPath} succeeded.`);
    } catch (err) {
      console.error(err);
      const errorBody = err.response?.data ?? err.message;
      setEndpointResult(typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody, null, 2));
      setStatus(`${method} ${normalizedPath} failed.`);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetEndpoint = (preset) => {
    setEndpointMethod(preset.method);
    setEndpointPath(preset.path);
    setEndpointPayload(preset.payload);
    runEndpoint(preset.method, preset.path, preset.payload);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="w-[280px] border-r border-white/10 px-6 py-8 flex flex-col gap-8">
          <div>
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 text-xl font-black">P</div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Pulse Learn</p>
                <h2 className="text-xl font-black">API Workspace</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">Learner profile</p>
                <p className="mt-4 text-sm font-semibold text-white">{profile.study_domain || 'General'} · {profile.expertise_level}</p>
                <p className="text-xs text-white/50 mt-1">{profile.mbti_type}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">Backend health</p>
                <p className="mt-4 text-sm text-white">{healthStatus}</p>
                <button
                  type="button"
                  onClick={checkHealth}
                  className="mt-4 btn-minimal w-full justify-center"
                >
                  <ShieldCheck size={16} />
                  Recheck
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="btn-minimal w-full justify-center"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </aside>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <section className="rounded-[2rem] border border-white/10 bg-black/90 p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3 max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Study plan generator</p>
                  <h1 className="text-4xl font-black tracking-tight">Generate a roadmap from a topic or syllabus.</h1>
                  <p className="text-sm text-white/60">
                    Use your profile to personalize the learning path and create a study plan that fits your next milestone.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter a topic or paste a syllabus excerpt"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    className="input-minimal"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Hours budget"
                      value={hours}
                      onChange={(event) => setHours(event.target.value)}
                      className="input-minimal"
                    />
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(event) => setTargetDate(event.target.value)}
                      className="input-minimal"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={createRoadmap}
                  disabled={loading}
                  className="btn-minimal w-full h-full"
                >
                  <ArrowRight size={18} />
                  Generate roadmap
                </button>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-[2rem] border border-white/10 bg-black/90 p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/50">Roadmaps</p>
                    <h2 className="text-2xl font-black">My generated plans</h2>
                  </div>
                  <button
                    type="button"
                    onClick={fetchRoadmaps}
                    className="btn-minimal"
                  >
                    Refresh list
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  {roadmaps.length ? (
                    roadmaps.map((roadmap) => (
                      <button
                        key={roadmap.id}
                        type="button"
                        onClick={() => setSelectedRoadmapId(roadmap.id)}
                        className={`w-full rounded-3xl border px-5 py-4 text-left transition ${
                          roadmap.id === selectedRoadmap?.id
                            ? 'border-white text-white bg-white/10'
                            : 'border-white/10 text-white/70 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold">{roadmap.title || 'Untitled roadmap'}</span>
                          <span className="text-[11px] uppercase tracking-[0.35em] text-white/50">{roadmap.created_at?.slice(0, 10) || '---'}</span>
                        </div>
                        <p className="mt-2 text-sm text-white/60">{roadmap.summary || roadmap.description || 'Generated study plan from your selected topic.'}</p>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                      No roadmaps yet. Generate one to see it here.
                    </div>
                  )}
                </div>

                {selectedRoadmap ? (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/95 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Selected roadmap</p>
                        <h3 className="text-xl font-black text-white">{selectedRoadmap.title}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={completeRoadmap}
                        className="btn-minimal"
                      >
                        Complete
                      </button>
                    </div>
                    <p className="mt-4 text-sm text-white/60">ID: {selectedRoadmap.id}</p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white/10 bg-black/90 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/50">Assistant</p>
                      <h3 className="text-xl font-black">Ask the learning AI</h3>
                    </div>
                    <Sparkles size={20} className="text-white/70" />
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <textarea
                        rows={4}
                        value={aiInput}
                        onChange={(event) => setAIInput(event.target.value)}
                        className="input-minimal min-h-[120px] resize-none"
                      />
                      <button
                        type="button"
                        onClick={sendAssistant}
                        disabled={aiLoading}
                        className="btn-minimal w-full"
                      >
                        {aiLoading ? 'Thinking…' : 'Send to AI'}
                      </button>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/80 max-h-72 overflow-y-auto">
                      {aiMessages.map((message, index) => (
                        <div key={`${message.role}-${index}`} className="mb-4 last:mb-0">
                          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">{message.role}</p>
                          <p className="text-sm text-white">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-black/90 p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Search</p>
                  <div className="mt-4 flex gap-3 flex-col sm:flex-row">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="input-minimal flex-1"
                      placeholder="Search workspace, pages, or nodes"
                    />
                    <button type="button" onClick={runSearch} className="btn-minimal">
                      <Search size={16} />
                      Search
                    </button>
                  </div>
                  {searchResults ? (
                    <div className="mt-5 space-y-3 text-sm text-white/70">
                      <div>
                        <p className="font-semibold text-white">Pages</p>
                        <p>{searchResults.pages?.length ?? 0} results</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Nodes</p>
                        <p>{searchResults.nodes?.length ?? 0} results</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Notes</p>
                        <p>{searchResults.notes?.length ?? 0} results</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-black/90 p-8">
              <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">API explorer</p>
                  <h2 className="text-2xl font-black">Call any backend route directly</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {API_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetEndpoint(preset)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70 hover:bg-white/10"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <select
                      value={endpointMethod}
                      onChange={(event) => setEndpointMethod(event.target.value)}
                      className="input-minimal"
                    >
                      {['GET', 'POST', 'PATCH', 'DELETE'].map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={endpointPath}
                      onChange={(event) => setEndpointPath(event.target.value)}
                      className="input-minimal"
                      placeholder="/api/health"
                    />
                    <button
                      type="button"
                      onClick={() => runEndpoint(endpointMethod, endpointPath, endpointPayload)}
                      className="btn-minimal"
                    >
                      Send
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={endpointPayload}
                    onChange={(event) => setEndpointPayload(event.target.value)}
                    className="input-minimal w-full font-mono text-sm"
                    placeholder="{ }"
                  />
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 overflow-auto max-h-[320px] font-mono text-sm text-white/80">
                  <pre>{endpointResult}</pre>
                </div>
              </div>
            </section>

            <div className="rounded-[2rem] border border-white/10 bg-black/90 p-6 text-sm text-white/60">
              Status: {status}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
