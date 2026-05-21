import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';
import { scoreMBTI } from '../services/mbtiService.js';
import { MBTI_AI_PROFILES } from '../lib/mbtiProfiles.js';
import { workspaceChat } from '../services/geminiService.js';

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;
const router = express.Router();

router.post('/profile', requireAuth, async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({ error: 'Server misconfigured: SUPABASE_URL is required for this request.' });
        }

        const {
            learning_style,
            expertise_level,
            communication_tone,
            study_domain,
            preferred_session_minutes,
            mbti_type,
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
                mbti_type,
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
        if (!supabase) {
            return res.json({ profile: null });
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        // Return null if not found — frontend will show onboarding wizard
        res.json({ profile: data || null });
    } catch (err) {
        // Return null instead of error to trigger onboarding if table exists
        res.json({ profile: null });
    }
});

// POST /api/user/mbti — scores the test, saves result, returns profile with type name
router.post('/mbti', requireAuth, async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({ error: 'Server misconfigured: SUPABASE_URL is required for this request.' });
        }

        const { answers } = req.body;

        if (!Array.isArray(answers) || answers.length !== 20) {
            return res.status(400).json({ error: 'Must provide exactly 20 answers' });
        }

        const { mbtiType, ei_score, sn_score, tf_score, jp_score } = scoreMBTI(answers);
        const typeProfile = MBTI_AI_PROFILES[mbtiType];

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: req.user.id,
                mbti_type: mbtiType,
                ei_score,
                sn_score,
                tf_score,
                jp_score,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            profile: {
                ...data,
                typeName: typeProfile.name,
                cognitiveStyle: typeProfile.cognitiveStyle,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/chat', requireAuth, async (req, res) => {
    try {
        const { message, history, workspaceNotes } = req.body;

        if (!supabase && req.user.id !== 'demo-user') {
            return res.status(500).json({ error: 'Server misconfigured: SUPABASE_URL is required for this request.' });
        }

        const { data: profile } = req.user.id === 'demo-user'
            ? { data: null }
            : await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', req.user.id)
                .single();

        const reply = await workspaceChat(message, history || [], profile, workspaceNotes);
        res.json({ reply });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
