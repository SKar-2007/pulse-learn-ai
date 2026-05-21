// POST /api/analytics/query — natural language to chart config
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { processAnalyticsQuery } from '../services/analyticsService.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.post('/query', requireAuth, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || query.trim().length < 5) {
            return res.status(400).json({ error: 'Query too short' });
        }

        // Fetch user profile for personalized insight framing
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        const chartConfig = await processAnalyticsQuery(query, req.user.id, profile);
        res.json({ chart: chartConfig });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
