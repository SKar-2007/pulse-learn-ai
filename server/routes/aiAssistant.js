import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';
import { workspaceChat } from '../services/geminiService.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { messages, pageContext, mbtiType } = req.body;
    const profile = req.user.id === 'demo-user'
      ? { mbti_type: 'INTJ', study_domain: 'AI Strategy', expertise_level: 'Intermediate' }
      : (await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', req.user.id)
          .single()).data;

    const reply = await workspaceChat({ messages, pageContext, mbtiType, profile });
    res.json({ reply });
  } catch (err) {
    console.error('AI assistant error:', err);
    res.status(500).json({ error: 'AI service is unavailable. Please try again in a moment.' });
  }
});

export default router;
