import { useState, useCallback } from 'react';
import { apiUrl, authHeaders } from '../lib/apiClient';

const DEMO_ROADMAPS = [
  {
    id: 'demo-roadmap',
    title: 'Pulse AI Learning Path',
    owner_id: 'demo-user',
    nodes: [
      {
        id: 'node-1',
        title: 'AI Foundations',
        summary: 'Understand core AI concepts, models, and learning loops.',
        status: 'completed',
        sequence_order: 1,
        remediation_depth: 0,
      },
      {
        id: 'node-2',
        title: 'Active Recall Practice',
        summary: 'Use explanation-based testing to strengthen memory.',
        status: 'unlocked',
        sequence_order: 2,
        remediation_depth: 0,
      },
      {
        id: 'node-3',
        title: 'Learning Synthesis',
        summary: 'Build an integrated roadmap and connect learning goals.',
        status: 'locked',
        sequence_order: 3,
        remediation_depth: 0,
      },
    ],
  },
];

const isDemoMode = (token) => import.meta.env.VITE_DEMO_MODE === 'true' || token === 'demo';

export default function useRoadmap() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
  });

  const loadRoadmaps = useCallback(async (token) => {
    const demo = isDemoMode(token);
    if (!token && !demo) return;
    setLoading(true);
    try {
      if (demo) {
        setRoadmaps(DEMO_ROADMAPS);
        setSelectedRoadmap(DEMO_ROADMAPS[0]);
        setNodes(DEMO_ROADMAPS[0].nodes || []);
        return;
      }

      const response = await fetch(apiUrl('/api/roadmap'), {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to load roadmaps');
      }
      setRoadmaps(data.roadmaps || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoadmap = useCallback(async (roadmapId, token) => {
    const demo = isDemoMode(token);
    if (!roadmapId && !demo) return;
    setLoading(true);
    try {
      if (demo) {
        const roadmap = DEMO_ROADMAPS.find((r) => r.id === roadmapId) || DEMO_ROADMAPS[0];
        setSelectedRoadmap(roadmap);
        setNodes(roadmap.nodes || []);
        return;
      }

      const response = await fetch(apiUrl(`/api/roadmap/${roadmapId}`), {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to load roadmap');
      }
      setSelectedRoadmap(data.roadmap);
      setNodes(data.roadmap.nodes || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
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
  };
}
