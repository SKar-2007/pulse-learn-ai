import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';
import { generateRecap } from '../services/geminiService.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.post('/:roadmapId', requireAuth, async (req, res) => {
  try {
    const { pageContext, mbtiType } = req.body;
    const recap = await generateRecap({ pageContext, mbtiType });
    res.json({ recap });
  } catch (err) {
    console.error('Recap error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
