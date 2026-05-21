// Supabase Realtime hook: subscribes to node changes and comment changes for a roadmap
import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtime(roadmapId, { onNodeUpdate, onCommentAdded }) {
    useEffect(() => {
        if (!roadmapId) return;

        // Create a single channel for this roadmap
        const channel = supabase
            .channel(`roadmap-${roadmapId}`)
            // Listen to any UPDATE on nodes in this roadmap
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'nodes',
                    filter: `roadmap_id=eq.${roadmapId}`,
                },
                (payload) => {
                    console.log('Node updated by collaborator:', payload.new);
                    onNodeUpdate(payload.new); // Pass the updated node to parent state
                }
            )
            // Listen to INSERT on nodes (remediation nodes from other users)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'nodes',
                    filter: `roadmap_id=eq.${roadmapId}`,
                },
                (payload) => {
                    console.log('New node inserted:', payload.new);
                    onNodeUpdate(payload.new);
                }
            )
            // Listen to new comments
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'node_comments',
                },
                (payload) => {
                    console.log('New comment:', payload.new);
                    if (onCommentAdded) onCommentAdded(payload.new);
                }
            )
            .subscribe();

        // Cleanup: unsubscribe when component unmounts or roadmapId changes
        return () => {
            supabase.removeChannel(channel);
        };
    }, [roadmapId, onNodeUpdate, onCommentAdded]);
}
