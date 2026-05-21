import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

// POST /api/collab/invite — owner invites a user by email to a roadmap
router.post('/invite', requireAuth, async (req, res) => {
    try {
        const { roadmap_id, invitee_email, role } = req.body;

        // Verify the requester is the owner
        const { data: roadmap } = await supabase
            .from('roadmaps')
            .select('owner_id')
            .eq('id', roadmap_id)
            .single();

        if (roadmap.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Only the roadmap owner can invite collaborators' });
        }

        // Look up the invitee's user ID by email
        const { data: invitee } = await supabase
            .from('users')
            .select('id')
            .eq('email', invitee_email)
            .single();

        if (!invitee) {
            return res.status(404).json({ error: 'No account found for that email' });
        }

        // Add to collaborators table
        const { data, error } = await supabase
            .from('roadmap_collaborators')
            .upsert({
                roadmap_id,
                user_id: invitee.id,
                role: role || 'viewer',
            })
            .select()
            .single();

        if (error) throw error;

        // Enable collaborative mode on the roadmap
        await supabase.from('roadmaps').update({ is_collaborative: true }).eq('id', roadmap_id);

        res.json({ collaborator: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/collab/:roadmap_id — list all collaborators with user details
router.get('/:roadmap_id', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('roadmap_collaborators')
            .select(`
        role,
        joined_at,
        users (id, email, display_name, avatar_url)
      `)
            .eq('roadmap_id', req.params.roadmap_id);

        if (error) throw error;
        res.json({ collaborators: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/collab/node/assign — assign a node to a specific user
router.patch('/node/assign', requireAuth, async (req, res) => {
    try {
        const { node_id, assigned_to } = req.body;
        const { error } = await supabase
            .from('nodes')
            .update({ assigned_to, last_updated_by: req.user.id, updated_at: new Date().toISOString() })
            .eq('id', node_id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/collab/comment — add a comment to a node
router.post('/comment', requireAuth, async (req, res) => {
    try {
        const { node_id, content } = req.body;
        const { data, error } = await supabase
            .from('node_comments')
            .insert({ node_id, user_id: req.user.id, content })
            .select(`*, users (display_name, avatar_url)`)
            .single();
        if (error) throw error;
        res.json({ comment: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
