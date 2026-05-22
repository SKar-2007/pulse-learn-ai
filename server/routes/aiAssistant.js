import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';
import { workspaceChat } from '../services/geminiService.js';

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;
const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { messages, pageContext, mbtiType } = req.body;
    const profile = req.user.id === 'demo-user'
      ? { mbti_type: 'INTJ', study_domain: 'AI Strategy', expertise_level: 'Intermediate' }
      : (supabase
          ? (await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', req.user.id)
              .single()).data
          : null);

    const reply = await workspaceChat({ messages, pageContext, mbtiType, profile });
    res.json({ reply });
  } catch (err) {
    console.error('AI assistant error:', err);
    const message = String(err?.message || '');
    if (message.includes('API key expired') || message.includes('API_KEY_INVALID') || message.includes('invalid API key')) {
      return res.status(500).json({ error: 'AI is unavailable because the Gemini API key is invalid or expired. Please renew or replace the key.' });
    }
    return res.status(500).json({ error: 'AI service is unavailable. Please try again in a moment.' });
  }
});

export default router;
