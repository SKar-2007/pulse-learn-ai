// Supabase Realtime hook: handles Postgres changes AND Presence (who is online)
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtime(roadmapId, userId, { onNodeUpdate, onCommentAdded }) {
    const [presence, setPresence] = useState({});
    const [channel, setChannel] = useState(null);
    const demoMode = import.meta.env.VITE_DEMO_MODE === 'true' || userId === 'demo-user';

    useEffect(() => {
        if (!roadmapId || !userId || demoMode) return;

        const chan = supabase.channel(`roadmap-${roadmapId}`, {
            config: {
                presence: {
                    key: userId,
                },
            },
        });

        chan
            // 1. Listen to Postgres Changes (Nodes & Comments)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'nodes', filter: `roadmap_id=eq.${roadmapId}` },
                (payload) => onNodeUpdate(payload.new || payload.old)
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'node_comments' },
                (payload) => onCommentAdded && onCommentAdded(payload.new)
            )
            // 2. Presence: Track who is currently viewing this roadmap
            .on('presence', { event: 'sync' }, () => {
                const state = chan.presenceState();
                const formatted = {};
                Object.keys(state).forEach(key => {
                    formatted[key] = state[key][0]; // Take latest presence state
                });
                setPresence(formatted);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    setChannel(chan);
                    await chan.track({
                        user_id: userId,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(chan);
        };
    }, [roadmapId, userId, onNodeUpdate, onCommentAdded, demoMode]);

    const trackCursor = async (pos) => {
        if (demoMode || !channel) return;
        await channel.track({
            user_id: userId,
            cursor: pos,
            online_at: new Date().toISOString(),
        });
    };

    return { presence, trackCursor };
}
