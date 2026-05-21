import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/roadmap`, {
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
    if (!roadmapId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/roadmap/${roadmapId}`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to load roadmap');
      }
      setSelectedRoadmap(data.roadmap);
      setNodes(data.nodes || []);
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
  };
}
