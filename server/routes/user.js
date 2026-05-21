import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.post('/profile', requireAuth, async (req, res) => {
    try {
        const {
            learning_style,
            expertise_level,
            communication_tone,
            study_domain,
            preferred_session_minutes,
        } = req.body;

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: req.user.id,
                learning_style,
                expertise_level,
                communication_tone,
                study_domain,
                preferred_session_minutes,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        res.json({ profile: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/profile', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        // Return null if not found — frontend will show onboarding wizard
        res.json({ profile: data || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
