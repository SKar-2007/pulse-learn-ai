-- Supabase schema for Pulse Learn AI
-- Run this inside the Supabase SQL editor.

-- Enable UUID generation if needed.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (supabase auth users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROADMAPS
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time_budget_hours INT NOT NULL,
    target_date DATE,
    stellar_tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NODES
CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    parent_node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    estimated_minutes INT NOT NULL,
    sequence_order INT NOT NULL,
    status TEXT DEFAULT 'locked',
    remediation_depth INT DEFAULT 0
);

-- ACTIVE RECALL LOGS
CREATE TABLE IF NOT EXISTS active_recall_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    quiz_score DECIMAL(5,2),
    ai_feedback TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

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
