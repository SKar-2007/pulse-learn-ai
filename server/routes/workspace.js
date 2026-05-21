import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

// GET /api/workspace/:roadmap_id — get the user's layout (or shared layout)
router.get('/:roadmap_id', requireAuth, async (req, res) => {
    try {
        const { is_shared } = req.query; // Client can request shared layout

        let query = supabase
            .from('workspace_layouts')
            .select('layout_json')
            .eq('roadmap_id', req.params.roadmap_id);

        if (is_shared === 'true') {
            query = query.eq('is_shared', true).order('updated_at', { ascending: false }).limit(1);
        } else {
            query = query.eq('user_id', req.user.id).eq('is_shared', false);
        }

        const { data, error } = await query.single();

        if (error && error.code !== 'PGRST116') throw error;
        res.json({ layout: data?.layout_json || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/workspace/layout — save layout
router.post('/layout', requireAuth, async (req, res) => {
    try {
        const { roadmap_id, layout_json, is_shared } = req.body;

        const payload = {
            roadmap_id,
            layout_json,
            is_shared: !!is_shared,
            updated_at: new Date().toISOString()
        };

        if (!is_shared) {
            payload.user_id = req.user.id;
        }

        const { data, error } = await supabase
            .from('workspace_layouts')
            .upsert(payload, { onConflict: 'roadmap_id,is_shared,user_id' })
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, layout: data.layout_json });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
