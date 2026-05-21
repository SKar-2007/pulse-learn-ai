import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

// GET /api/workspace/:roadmap_id — get the user's layout (or shared layout)
router.get('/:roadmap_id', requireAuth, async (req, res) => {
    try {
        const { is_shared, page_id } = req.query;

        if (page_id) {
            const { data, error } = await supabase
                .from('workspace_pages')
                .select('layout_json')
                .eq('id', page_id)
                .eq('user_id', req.user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return res.json({ layout: data?.layout_json || [] });
        }

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
        const { roadmap_id, layout_json, is_shared, page_id } = req.body;

        if (page_id) {
            const { data, error } = await supabase
                .from('workspace_pages')
                .update({ layout_json })
                .eq('id', page_id)
                .eq('user_id', req.user.id)
                .select()
                .single();

            if (error) throw error;
            return res.json({ success: true, layout: data.layout_json });
        }

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

// GET /api/workspace/:roadmapId/pages — list workspace pages
router.get('/:roadmap_id/pages', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('workspace_pages')
            .select('id, title, icon, parent_page_id, sequence_order')
            .eq('roadmap_id', req.params.roadmap_id)
            .eq('user_id', req.user.id)
            .order('sequence_order', { ascending: true });

        if (error) throw error;
        res.json({ pages: data || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/workspace/:roadmapId/pages — create a new workspace page
router.post('/:roadmap_id/pages', requireAuth, async (req, res) => {
    try {
        const { title, parent_page_id, icon } = req.body;
        const { data, error } = await supabase
            .from('workspace_pages')
            .insert({
                roadmap_id: req.params.roadmap_id,
                user_id: req.user.id,
                title: title || 'Untitled Page',
                icon: icon || '📄',
                parent_page_id: parent_page_id || null,
                layout_json: [],
            })
            .select()
            .single();

        if (error) throw error;
        res.json({ page: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/workspace/:roadmap_id/pages/:page_id — load a specific page and its layout
router.get('/:roadmap_id/pages/:page_id', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('workspace_pages')
            .select('id, title, icon, parent_page_id, sequence_order, layout_json, roadmap_id')
            .match({ id: req.params.page_id, roadmap_id: req.params.roadmap_id, user_id: req.user.id })
            .single();

        if (error) throw error;
        res.json({ page: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/workspace/:roadmap_id/pages/:page_id/layout — save page-specific layout
router.post('/:roadmap_id/pages/:page_id/layout', requireAuth, async (req, res) => {
    try {
        const { layout_json } = req.body;
        const { data, error } = await supabase
            .from('workspace_pages')
            .update({ layout_json })
            .match({ id: req.params.page_id, roadmap_id: req.params.roadmap_id, user_id: req.user.id })
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, layout: data.layout_json });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/workspace/:roadmap_id/pages/:page_id/duplicate — duplicate a page
router.post('/:roadmap_id/pages/:page_id/duplicate', requireAuth, async (req, res) => {
    try {
        const { title } = req.body;
        const { data: original, error: originalError } = await supabase
            .from('workspace_pages')
            .select('title, icon, parent_page_id, layout_json')
            .match({ id: req.params.page_id, roadmap_id: req.params.roadmap_id, user_id: req.user.id })
            .single();

        if (originalError) throw originalError;

        const { data, error } = await supabase
            .from('workspace_pages')
            .insert({
                roadmap_id: req.params.roadmap_id,
                user_id: req.user.id,
                title: title || `Copy of ${original.title}`,
                icon: original.icon,
                parent_page_id: original.parent_page_id,
                layout_json: original.layout_json || [],
            })
            .select()
            .single();

        if (error) throw error;
        res.json({ page: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
