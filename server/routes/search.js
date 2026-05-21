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

    const [pagesResponse, nodesResponse, pageLayoutsResponse] = await Promise.all([
      supabase.from('workspace_pages')
        .select('id, title, icon, roadmap_id')
        .eq('user_id', req.user.id)
        .ilike('title', `%${q}%`)
        .limit(8),
      supabase.from('nodes')
        .select('id, title, roadmap_id, status')
        .ilike('title', `%${q}%`)
        .limit(10),
      supabase.from('workspace_pages')
        .select('id, title, roadmap_id, layout_json')
        .eq('user_id', req.user.id)
        .limit(20),
    ]);

    const noteResults = [];

    (pageLayoutsResponse.data || []).forEach((page) => {
      const blocks = Array.isArray(page.layout_json) ? page.layout_json : [];
      blocks.forEach((block, index) => {
        const blockContent = block?.config?.text || block?.config?.content || block?.config?.summary || block?.config?.notes || '';
        if (typeof blockContent === 'string' && blockContent.toLowerCase().includes(q.toLowerCase())) {
          noteResults.push({
            id: `${page.id}-${index}`,
            page_id: page.id,
            page_title: page.title,
            roadmap_id: page.roadmap_id,
            block_type: block.type,
            title: block.type === 'notes' ? 'Notes block' : `${block.type.charAt(0).toUpperCase() + block.type.slice(1)} block`,
            content: blockContent.trim().slice(0, 150),
          });
        }
      });
    });

    res.json({
      results: {
        pages: pagesResponse.data || [],
        nodes: nodesResponse.data || [],
        notes: noteResults,
      },
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
