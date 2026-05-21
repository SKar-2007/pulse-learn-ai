import { useState } from 'react';
import axios from 'axios';
import {API_BASE} from '../../lib/apiClient';

export default function RecapBlock({ config = {}, roadmap, session, profile, workspaceNotes }) {
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(false);
  const roadmapId = config.roadmapId || roadmap?.id;
  const pageContext = workspaceNotes || config.pageContext || JSON.stringify({ nodes: config.nodes, collaborators: config.collaborators });

  const generateRecap = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/recap/${roadmapId}`,
        { pageContext, mbtiType: profile?.mbti_type },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      setRecap(data.recap);
    } catch (error) {
      console.error('Recap generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full p-4 space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 text-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">AI Recap</h3>
          <p className="text-xs text-slate-500">Generate a summary of this page and its progress.</p>
        </div>
        <button
          onClick={generateRecap}
          className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-indigo-500 transition"
          disabled={loading}
        >
          {loading ? 'Generating…' : 'Regenerate'}
        </button>
      </div>
      {recap ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">{recap.headline}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard title="Completed" items={recap.completedNodes} />
            <SummaryCard title="Weak Areas" items={recap.weakAreas} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard title="Collaborator Activity" items={recap.collaboratorActivity} />
            <SummaryCard title="Next Steps" items={recap.nextSteps} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Click regenerate to create an AI recap for this page.</p>
      )}
    </div>
  );
}

function SummaryCard({ title, items }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 mb-2">{title}</p>
      {items?.length ? (
        <ul className="space-y-2 text-sm text-slate-300">
          {items.map((item, index) => (
            <li key={index} className="list-disc list-inside">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">No items available yet.</p>
      )}
    </div>
  );
}