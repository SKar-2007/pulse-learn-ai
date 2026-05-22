import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';
import { executeMCPAction } from '../services/mcpBridgeService.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.get('/:roadmapId', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('mcp_connections')
      .select('*')
      .eq('roadmap_id', req.params.roadmapId)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ connections: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:roadmapId', requireAuth, async (req, res) => {
  try {
    const { service, connection_config } = req.body;
    const { data, error } = await supabase.from('mcp_connections')
      .insert({
        roadmap_id: req.params.roadmapId,
        user_id: req.user.id,
        service,
        connection_config,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ connection: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:connectionId', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('mcp_connections')
      .delete()
      .eq('id', req.params.connectionId)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:roadmapId/action', requireAuth, async (req, res) => {
  try {
    const { service, action_type, payload } = req.body;
    const { data: connection, error } = await supabase.from('mcp_connections')
      .select('*')
      .eq('roadmap_id', req.params.roadmapId)
      .eq('user_id', req.user.id)
      .eq('service', service)
      .maybeSingle();

    if (error) throw error;
    if (!connection) {
      return res.status(404).json({ error: 'MCP connection not found.' });
    }

    const result = await executeMCPAction(connection, action_type, payload);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
