import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

export default function useLoopComponents(roadmapId, session) {
  const [components, setComponents] = useState([]);

  useEffect(() => {
    if (!roadmapId || !session?.access_token) return;

    const load = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/loop-component?roadmapId=${roadmapId}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        setComponents(data.components || []);
      } catch (error) {
        console.error('Failed to load loop components', error);
      }
    };

    load();

    const channel = supabase
      .channel(`loop-${roadmapId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'loop_components',
        filter: `roadmap_id=eq.${roadmapId}`,
      }, (payload) => {
        setComponents((prev) => prev.map((c) => (c.id === payload.new.id ? { ...c, ...payload.new } : c)));
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [roadmapId, session]);

  const detachBlock = async (block) => {
    if (!session?.access_token) return null;
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/loop-component`,
      {
        roadmap_id: roadmapId,
        block_type: block.type,
        block_config: block.config,
        title: block.config?.title || 'Shared Block',
      },
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    );
    setComponents((prev) => [...prev, data.component]);
    return data.component;
  };

  const getShareLink = (component) => `${window.location.origin}/shared/component/${component.share_token}`;

  return { components, detachBlock, getShareLink };
}
