import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';
import { executeMCPAction } from '../services/mcpBridgeService.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

function resolveTemplateVars(config = {}, triggerData = {}) {
  const json = JSON.stringify(config);
  const replaced = json.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    return triggerData[key] ?? triggerData[key.trim()] ?? '';
  });
  return JSON.parse(replaced);
}

router.get('/:roadmapId', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('automation_rules')
      .select('*, mcp_connections(*)')
      .eq('roadmap_id', req.params.roadmapId)
      .eq('user_id', req.user.id)
      .eq('is_active', true);

    if (error) throw error;
    res.json({ rules: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:roadmapId', requireAuth, async (req, res) => {
  try {
    const { trigger_type, action_type, action_config } = req.body;
    const { data, error } = await supabase.from('automation_rules')
      .insert({
        roadmap_id: req.params.roadmapId,
        user_id: req.user.id,
        trigger_type,
        action_type,
        action_config,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ rule: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:ruleId', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('automation_rules')
      .delete()
      .eq('id', req.params.ruleId)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/trigger', requireAuth, async (req, res) => {
  try {
    const { roadmap_id, trigger_type, trigger_data = {} } = req.body;
    const { data: rules, error } = await supabase.from('automation_rules')
      .select('*, mcp_connections(*)')
      .eq('roadmap_id', roadmap_id)
      .eq('trigger_type', trigger_type)
      .eq('is_active', true);

    if (error) throw error;
    const results = await Promise.allSettled(
      (rules || []).map((rule) => {
        const resolved = resolveTemplateVars(rule.action_config, trigger_data);
        return executeMCPAction(rule.mcp_connections, rule.action_type, resolved);
      })
    );

    await supabase.from('automation_rules')
      .update({ last_triggered_at: new Date().toISOString() })
      .in('id', (rules || []).map((rule) => rule.id));

    res.json({ triggered: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
