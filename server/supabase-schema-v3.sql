-- ── EXTEND user_profiles for MBTI ────────────────────────────────────────────
-- This replaces the v2 user_profiles table with a more comprehensive cognitive profile.

CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- MBTI result (the 4-letter type, computed from test answers)
    mbti_type TEXT,
    -- One of: 'INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
    --         'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'

    -- Raw dimension scores (stored so we can re-derive type or show breakdown)
    ei_score INTEGER DEFAULT 0,  -- Positive = Extravert, Negative = Introvert
    sn_score INTEGER DEFAULT 0,  -- Positive = iNtuitive, Negative = Sensing
    tf_score INTEGER DEFAULT 0,  -- Positive = Feeling, Negative = Thinking
    jp_score INTEGER DEFAULT 0,  -- Positive = Perceiving, Negative = Judging

    -- Contextual preferences
    study_domain TEXT DEFAULT NULL,
    preferred_session_minutes INTEGER DEFAULT 30,
    weekly_hours_available INTEGER DEFAULT 10,

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users manage own profile
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own profile" ON public.user_profiles;
CREATE POLICY "Users manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- ── WORKSPACE LAYOUTS ─────────────────────────────────────────────────────────
-- Persists the block layout of each user's workspace per roadmap.
CREATE TABLE IF NOT EXISTS public.workspace_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_shared BOOLEAN DEFAULT FALSE,

    -- Full react-grid-layout JSON: array of { i, x, y, w, h, type, config }
    layout_json JSONB NOT NULL DEFAULT '[]'::jsonb,

    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(roadmap_id, is_shared, user_id)
);

ALTER TABLE public.workspace_layouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own layouts" ON public.workspace_layouts;
CREATE POLICY "Users manage own layouts" ON public.workspace_layouts
  FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime on workspace layouts
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_layouts;
