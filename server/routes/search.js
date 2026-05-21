import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) {
      return res.json({ results: { pages: [], nodes: [], notes: [] } });
    }

    const [pagesResponse, nodesResponse] = await Promise.all([
      supabase.from('workspace_pages')
        .select('id, title, icon, roadmap_id')
        .eq('user_id', req.user.id)
        .ilike('title', `%${q}%`)
        .limit(8),
      supabase.from('nodes')
        .select('id, title, roadmap_id, status')
        .ilike('title', `%${q}%`)
        .limit(10),
    ]);

    res.json({
      results: {
        pages: pagesResponse.data || [],
        nodes: nodesResponse.data || [],
        notes: [],
      },
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
