-- ── EXTENSIONS ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TABLE 1: USERS ───────────────────────────────────────────────────────────
-- Synced from Supabase Auth via a trigger on auth.users
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create user row when Supabase Auth signup happens
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();


-- ── TABLE 2: USER PERSONALITY PROFILES ───────────────────────────────────────
-- Filled during post-signup onboarding wizard. Every AI call reads from this.
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

    -- Learning style
    learning_style TEXT NOT NULL DEFAULT 'visual',
    -- Options: 'visual' | 'reading' | 'kinesthetic' | 'auditory'

    -- Background level for AI tone calibration
    expertise_level TEXT NOT NULL DEFAULT 'beginner',
    -- Options: 'beginner' | 'intermediate' | 'advanced' | 'expert'

    -- Communication style preference
    communication_tone TEXT NOT NULL DEFAULT 'friendly',
    -- Options: 'friendly' | 'formal' | 'socratic' | 'direct' | 'encouraging'

    -- Primary domain of study (used for analogies)
    study_domain TEXT DEFAULT NULL,
    -- e.g. 'computer science', 'medicine', 'law', 'business', 'arts'

    -- Preferred session length
    preferred_session_minutes INT DEFAULT 30,
    -- How long they want each study block to be

    -- Weekly availability
    weekly_hours_available INT DEFAULT 10,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ── TABLE 3: ROADMAPS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time_budget_hours INT NOT NULL,
    target_date DATE,
    stellar_tx_hash TEXT,
    is_collaborative BOOLEAN DEFAULT FALSE,  -- Enables multi-user mode
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ── TABLE 4: ROADMAP COLLABORATORS ───────────────────────────────────────────
-- Tracks who has access to a collaborative roadmap and their role
CREATE TABLE IF NOT EXISTS roadmap_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer',
    -- Options: 'owner' | 'editor' | 'viewer'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(roadmap_id, user_id)  -- One role per user per roadmap
);


-- ── TABLE 5: NODES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    parent_node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    estimated_minutes INT NOT NULL,
    sequence_order INT NOT NULL,
    status TEXT DEFAULT 'locked',
    -- 'locked' | 'unlocked' | 'in_progress' | 'completed'
    assigned_to UUID REFERENCES users(id),
    -- In collaborative mode: which user "owns" this node
    remediation_depth INT DEFAULT 0,
    last_updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ── TABLE 6: ACTIVE RECALL LOGS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS active_recall_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    quiz_score DECIMAL(5,2),
    ai_feedback TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ── TABLE 7: NODE COMMENTS ───────────────────────────────────────────────────
-- Collaborators can leave comments on any node (like Google Docs comments)
CREATE TABLE IF NOT EXISTS node_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access own or collaborative roadmaps" ON roadmaps
  FOR ALL USING (
    auth.uid() = owner_id OR
    id IN (
      SELECT roadmap_id FROM roadmap_collaborators WHERE user_id = auth.uid()
    )
  );

ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access nodes of accessible roadmaps" ON nodes
  FOR ALL USING (
    roadmap_id IN (
      SELECT id FROM roadmaps WHERE owner_id = auth.uid()
      UNION
      SELECT roadmap_id FROM roadmap_collaborators WHERE user_id = auth.uid()
    )
  );

ALTER TABLE roadmap_collaborators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborators can see their memberships" ON roadmap_collaborators
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can manage collaborators" ON roadmap_collaborators
  FOR ALL USING (
    roadmap_id IN (SELECT id FROM roadmaps WHERE owner_id = auth.uid())
  );

ALTER TABLE node_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborators can comment" ON node_comments
  FOR ALL USING (
    node_id IN (
      SELECT id FROM nodes WHERE roadmap_id IN (
        SELECT id FROM roadmaps WHERE owner_id = auth.uid()
        UNION
        SELECT roadmap_id FROM roadmap_collaborators WHERE user_id = auth.uid()
      )
    )
  );

ALTER TABLE active_recall_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own logs" ON active_recall_logs
  FOR ALL USING (auth.uid() = user_id);


-- ── REALTIME PUBLICATIONS (needed for live sync) ──────────────────────────────
-- Enable Realtime on the tables that need live updates
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE node_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE roadmap_collaborators;
