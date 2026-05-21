import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const DEMO_LAYOUT = [
  { i: 'block-1', x: 0, y: 0, w: 4, h: 4, type: 'quiz', config: {} },
  { i: 'block-2', x: 4, y: 0, w: 4, h: 4, type: 'progress', config: {} },
  { i: 'block-3', x: 8, y: 0, w: 4, h: 4, type: 'notes', config: { text: 'Use demo mode to explore workspace blocks and notes.' } },
];

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export default function useWorkspace(roadmapId, session, isShared = false) {
    const [layout, setLayout] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadLayout = useCallback(async () => {
        const demo = DEMO_MODE || session?.access_token === 'demo';
        if (!roadmapId && !demo) return;
        setLoading(true);
        try {
            if (demo) {
                setLayout(DEMO_LAYOUT);
                return;
            }
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/workspace/${roadmapId}?is_shared=${isShared}`,
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            setLayout(data.layout || []);
        } catch (err) {
            console.error('Failed to load workspace:', err);
        } finally {
            setLoading(false);
        }
    }, [roadmapId, session, isShared]);

    const saveLayout = async (newLayout) => {
        const demo = DEMO_MODE || session?.access_token === 'demo';
        if (!roadmapId && !demo) return;
        if (demo) {
            setLayout(newLayout);
            return;
        }
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/workspace/layout`,
                { roadmap_id: roadmapId, layout_json: newLayout, is_shared: isShared },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
        } catch (err) {
            console.error('Failed to save workspace:', err);
        }
    };

    // Realtime sync for collaborative layout
    useEffect(() => {
        const demo = DEMO_MODE || session?.access_token === 'demo';
        if (!roadmapId || !isShared || demo) return;
        const channel = supabase
            .channel(`workspace-${roadmapId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'workspace_layouts',
                filter: `roadmap_id=eq.${roadmapId}`
            }, (payload) => {
                if (payload.new.is_shared) {
                    setLayout(payload.new.layout_json);
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [roadmapId, session, isShared]);

    useEffect(() => {
        loadLayout();
    }, [loadLayout]);

    return { layout, setLayout, saveLayout, loading };
}
