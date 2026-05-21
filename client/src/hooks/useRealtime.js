// Supabase Realtime hook: handles Postgres changes AND Presence (who is online)
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtime(roadmapId, userId, { onNodeUpdate, onCommentAdded }) {
    const [presence, setPresence] = useState({});

    useEffect(() => {
        if (!roadmapId || !userId) return;

        const channel = supabase.channel(`roadmap-${roadmapId}`, {
            config: {
                presence: {
                    key: userId,
                },
            },
        });

        channel
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
                const state = channel.presenceState();
                setPresence(state);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('User joined roadmap view:', key, newPresences);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('User left roadmap view:', key, leftPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track current user's presence
                    await channel.track({
                        user_id: userId,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roadmapId, userId, onNodeUpdate, onCommentAdded]);

    return { presence };
}
