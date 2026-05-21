import express from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const roadmapId = req.query.roadmapId;
    const { data, error } = await supabase
      .from('loop_components')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .eq('owner_user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ components: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { roadmap_id, block_type, block_config, title, share_scope } = req.body;
    const shareToken = crypto.randomBytes(12).toString('hex');
    const { data, error } = await supabase.from('loop_components').insert({
      owner_user_id: req.user.id,
      roadmap_id,
      block_type,
      block_config,
      title: title || 'Shared Component',
      share_scope: share_scope || 'team',
      share_token: shareToken,
    }).select().single();

    if (error) throw error;
    res.json({ component: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('loop_components')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json({ component: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shared/:token', async (req, res) => {
  try {
    const { data, error } = await supabase.from('loop_components')
      .select('*')
      .eq('share_token', req.params.token)
      .eq('share_scope', 'public')
      .single();
    if (error) return res.status(404).json({ error: 'Not found' });
    res.json({ component: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { block_config, title, share_scope } = req.body;
    const updates = {};
    if (block_config) updates.block_config = block_config;
    if (title) updates.title = title;
    if (share_scope) updates.share_scope = share_scope;

    const { data, error } = await supabase.from('loop_components')
      .update(updates)
      .eq('id', req.params.id)
      .eq('owner_user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ component: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
