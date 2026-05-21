import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';
import { workspaceChat } from '../services/geminiService.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { messages, pageContext, mbtiType } = req.body;
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    const reply = await workspaceChat({ messages, pageContext, mbtiType, profile });
    res.json({ reply });
  } catch (err) {
    console.error('AI assistant error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
