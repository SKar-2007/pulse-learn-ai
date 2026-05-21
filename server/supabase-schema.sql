-- Supabase schema for Pulse Learn AI
-- Run this inside the Supabase SQL editor.

-- Enable UUID generation if needed.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS (supabase auth users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROADMAPS
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    time_budget_hours INT NOT NULL CHECK (time_budget_hours > 0),
    target_date DATE,
    stellar_tx_hash TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_status ON roadmaps(status);

-- NODES
CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    parent_node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    estimated_minutes INT NOT NULL CHECK (estimated_minutes >= 1),
    sequence_order INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'completed', 'remediation')),
    remediation_depth INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nodes_roadmap_id ON nodes(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_nodes_sequence_order ON nodes(roadmap_id, sequence_order);

-- ACTIVE RECALL LOGS
CREATE TABLE IF NOT EXISTS active_recall_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    quiz_score NUMERIC(5,2) CHECK (quiz_score >= 0 AND quiz_score <= 1),
    ai_feedback TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_active_logs_user_id ON active_recall_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_active_logs_node_id ON active_recall_logs(node_id);

-- Automatic update timestamp helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roadmaps_updated_at
BEFORE UPDATE ON roadmaps
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER nodes_updated_at
BEFORE UPDATE ON nodes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- RLS policies
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own roadmaps" ON roadmaps
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own nodes" ON nodes
  FOR ALL USING (
    roadmap_id IN (SELECT id FROM roadmaps WHERE user_id = auth.uid())
  );

ALTER TABLE active_recall_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own logs" ON active_recall_logs
  FOR ALL USING (auth.uid() = user_id);
