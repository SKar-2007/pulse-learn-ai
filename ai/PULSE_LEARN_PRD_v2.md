# Product Requirement Document (PRD) — Version 2.0
## Pulse-Learn AI — Agentic AI Learning Engine with Stellar-Backed Proof of Knowledge

**Version:** 2.0 (adds Personalization, Analytics Dashboard, Multi-User Collaboration)
**Primary IDE:** VSCode with GitHub Copilot
**Target:** Hackathon Sprint (~24–32 Hours)

---

## Table of Contents

1. [What Changed in v2](#1-what-changed-in-v2)
2. [Full Tech Stack & New Dependencies](#2-full-tech-stack--new-dependencies)
3. [Updated Repository & Folder Structure](#3-updated-repository--folder-structure)
4. [Database Schema — Full v2](#4-database-schema--full-v2)
5. [Feature A: Personality-Driven Auth & Personalization Engine](#5-feature-a-personality-driven-auth--personalization-engine)
6. [Feature B: Natural Language Analytics Dashboard](#6-feature-b-natural-language-analytics-dashboard)
7. [Feature C: Multi-User Collaboration (Real-Time)](#7-feature-c-multi-user-collaboration-real-time)
8. [Updated AI Prompt Engineering Contracts](#8-updated-ai-prompt-engineering-contracts)
9. [Backend — All Routes Reference](#9-backend--all-routes-reference)
10. [Frontend — All Components Reference](#10-frontend--all-components-reference)
11. [Supabase Realtime Setup](#11-supabase-realtime-setup)
12. [Stellar Blockchain Module (Unchanged)](#12-stellar-blockchain-module-unchanged)
13. [Full API Contract Table](#13-full-api-contract-table)
14. [Edge Cases & Mitigations](#14-edge-cases--mitigations)
15. [Environment Variables Reference](#15-environment-variables-reference)
16. [Deployment Checklist](#16-deployment-checklist)
17. [GitHub Copilot Prompt Cheatsheet v2](#17-github-copilot-prompt-cheatsheet-v2)

---

## 1. What Changed in v2

| Feature | v1 | v2 |
|---|---|---|
| User identity | Demo user ID hardcoded | Full Supabase Auth (email/OAuth) + personality profile |
| AI tone | Generic educational output | Adapts to user's background level, learning style, communication tone |
| Quiz questions | Same format for everyone | Framed around user's domain, vocabulary, analogies from their profile |
| Progress data | Stored but not visualized | Natural language analytics: "Show me my score trend as a line chart" |
| Roadmap ownership | Single user only | Multi-user with roles (Owner, Collaborator, Viewer), real-time sync |
| Node updates | Polling or page refresh | Supabase Realtime channels — live node status updates across all collaborators |

---

## 2. Full Tech Stack & New Dependencies

### Backend

```bash
cd server
npm install express cors multer dotenv @supabase/supabase-js @google/generative-ai \
  @stellar/stellar-sdk pdf-parse uuid ws
```

`ws` is the WebSocket package — used only as a fallback; Supabase Realtime handles most of the live sync natively.

### Frontend

```bash
cd client
npm install tailwindcss @tailwindcss/vite lucide-react framer-motion \
  @supabase/supabase-js axios recharts react-confetti
```

**New packages explained:**

| Package | Why |
|---|---|
| `recharts` | Renders bar, line, pie, radar charts from JSON data — works perfectly with dynamic Gemini-generated chart configs |
| `react-confetti` | Fullscreen confetti on course completion modal |
| `@supabase/supabase-js` (client) | Used for both Auth and Realtime channel subscriptions directly from the browser |

---

## 3. Updated Repository & Folder Structure

```
pulse-learn/
├── client/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   │   ├── LoginForm.jsx            # Supabase email/OAuth login
│       │   │   └── PersonalityOnboarding.jsx # 5-question profile wizard (post-signup)
│       │   ├── tree/
│       │   │   ├── SkillTree.jsx            # SVG node canvas
│       │   │   └── NodeCard.jsx             # Individual node with collaborator avatars
│       │   ├── quiz/
│       │   │   └── QuizPanel.jsx            # Personalized quiz + result display
│       │   ├── analytics/
│       │   │   ├── AnalyticsDashboard.jsx   # Chart gallery + NL query bar
│       │   │   └── ChartRenderer.jsx        # Renders recharts from Gemini config JSON
│       │   ├── collab/
│       │   │   ├── CollabSidebar.jsx        # Active collaborators, roles, invite
│       │   │   └── PresenceBar.jsx          # Who is viewing which node right now
│       │   ├── UploadForm.jsx
│       │   └── StellarModal.jsx
│       ├── hooks/
│       │   ├── useAuth.js                   # Wraps Supabase Auth session
│       │   ├── useRoadmap.js
│       │   ├── useQuiz.js
│       │   ├── useRealtime.js               # Supabase Realtime channel subscription
│       │   └── useAnalytics.js              # NL query → chart config pipeline
│       ├── lib/
│       │   ├── supabaseClient.js
│       │   └── chartTypes.js               # Chart type enum + Recharts component map
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── routes/
│   │   ├── roadmap.js
│   │   ├── node.js
│   │   ├── analytics.js                    # POST /api/analytics/query
│   │   └── collab.js                       # Invite, role management
│   ├── services/
│   │   ├── geminiService.js                # Updated: personality context injected
│   │   ├── supabaseService.js              # Updated: collaboration queries
│   │   ├── analyticsService.js             # NL → chart config via Gemini
│   │   └── stellarService.js
│   ├── middleware/
│   │   ├── upload.js
│   │   └── auth.js                         # JWT verification from Supabase
│   └── index.js
│
└── README.md
```

---

## 4. Database Schema — Full v2

Paste this entire block into the Supabase SQL editor. It extends v1 with 4 new tables.

```sql
-- ── EXTENSIONS ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TABLE 1: USERS ───────────────────────────────────────────────────────────
-- Synced from Supabase Auth via a trigger on auth.users
CREATE TABLE users (
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();


-- ── TABLE 2: USER PERSONALITY PROFILES ───────────────────────────────────────
-- Filled during post-signup onboarding wizard. Every AI call reads from this.
CREATE TABLE user_profiles (
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
CREATE TABLE roadmaps (
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
CREATE TABLE roadmap_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer',
    -- Options: 'owner' | 'editor' | 'viewer'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(roadmap_id, user_id)  -- One role per user per roadmap
);


-- ── TABLE 5: NODES ───────────────────────────────────────────────────────────
CREATE TABLE nodes (
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
CREATE TABLE active_recall_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    quiz_score DECIMAL(5,2),
    ai_feedback TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ── TABLE 7: NODE COMMENTS ───────────────────────────────────────────────────
-- Collaborators can leave comments on any node (like Google Docs comments)
CREATE TABLE node_comments (
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
ALTER PUBLICATION supabase_realtime ADD TABLE nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE node_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE roadmap_collaborators;
```

---

## 5. Feature A: Personality-Driven Auth & Personalization Engine

### 5.1 How It Works End-to-End

```
User signs up (Supabase Auth)
       ↓
Trigger auto-creates users row
       ↓
App detects no user_profiles row exists → shows PersonalityOnboarding wizard
       ↓
User answers 5 questions → profile saved to user_profiles
       ↓
Every Gemini call now receives a personalityContext block built from this profile
       ↓
AI adjusts: tone, vocabulary depth, analogy domain, quiz question framing
```

### 5.2 Auth Middleware (`server/middleware/auth.js`)

```javascript
// JWT verification middleware: extracts Supabase user from Authorization header
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user; // Now available in all route handlers as req.user.id
  next();
}
```

Apply to every protected route:

```javascript
// In roadmap.js, node.js, analytics.js, collab.js
import { requireAuth } from '../middleware/auth.js';
router.post('/generate', requireAuth, upload.single('file'), async (req, res) => {
  const userId = req.user.id; // Safe — verified JWT
  // ...
});
```

### 5.3 Personality Onboarding Component (`client/src/components/auth/PersonalityOnboarding.jsx`)

```jsx
// React multi-step onboarding wizard: 5 questions about learning style, expertise, tone, domain, schedule
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const STEPS = [
  {
    key: 'expertise_level',
    question: "How would you describe your current knowledge level in the subject you're about to study?",
    options: [
      { value: 'beginner', label: '🌱 Complete beginner — start from scratch' },
      { value: 'intermediate', label: '📚 Some background — I know the basics' },
      { value: 'advanced', label: '🔬 Advanced — I want focused deep dives' },
      { value: 'expert', label: '🎓 Expert — I just need structured review' },
    ],
  },
  {
    key: 'learning_style',
    question: 'How do you learn best?',
    options: [
      { value: 'visual', label: '🎨 Visual — diagrams, flowcharts, maps' },
      { value: 'reading', label: '📖 Reading — detailed written explanations' },
      { value: 'kinesthetic', label: '🛠️ Hands-on — examples and practice problems' },
      { value: 'auditory', label: '🎧 Conversational — explain it like you\'d tell a friend' },
    ],
  },
  {
    key: 'communication_tone',
    question: 'What teaching style feels most natural to you?',
    options: [
      { value: 'friendly', label: '😊 Friendly & encouraging — keep it warm' },
      { value: 'direct', label: '⚡ Direct & concise — no fluff' },
      { value: 'socratic', label: '🤔 Socratic — ask me questions, make me think' },
      { value: 'formal', label: '🎩 Formal — academic and precise' },
    ],
  },
  {
    key: 'study_domain',
    question: 'What is your primary field of study or work?',
    options: [
      { value: 'computer_science', label: '💻 Computer Science / Engineering' },
      { value: 'medicine', label: '🏥 Medicine / Life Sciences' },
      { value: 'business', label: '📊 Business / Finance' },
      { value: 'humanities', label: '📜 Humanities / Law / Social Sciences' },
    ],
  },
  {
    key: 'preferred_session_minutes',
    question: 'How long is your ideal single study session?',
    options: [
      { value: 15, label: '⚡ 15 min — quick focused bursts' },
      { value: 30, label: '📐 30 min — standard Pomodoro' },
      { value: 60, label: '🔥 60 min — deep work sessions' },
      { value: 90, label: '🧠 90 min — marathon focus blocks' },
    ],
  },
];

export default function PersonalityOnboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSelect = (value) => {
    const newAnswers = { ...answers, [STEPS[step].key]: value };
    setAnswers(newAnswers);

    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      handleSave(newAnswers);
    }
  };

  const handleSave = async (finalAnswers) => {
    setSaving(true);
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/user/profile`,
      finalAnswers,
      { headers: { Authorization: `Bearer ${user.access_token}` } }
    );
    onComplete(finalAnswers);
  };

  const current = STEPS[step];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        {/* Progress bar */}
        <div className="flex gap-2 mb-10">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-indigo-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-400 text-sm mb-2">Question {step + 1} of {STEPS.length}</p>
            <h2 className="text-2xl font-bold text-white mb-8">{current.question}</h2>
            <div className="space-y-3">
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="w-full text-left px-5 py-4 rounded-xl border border-gray-700 bg-gray-900 
                    hover:border-indigo-500 hover:bg-indigo-950 transition-all duration-200 text-white"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {saving && (
          <p className="text-center text-indigo-400 mt-8 animate-pulse">
            Building your personalized learning engine...
          </p>
        )}
      </div>
    </div>
  );
}
```

### 5.4 User Profile Route (`server/routes/user.js`)

```javascript
// POST /api/user/profile — save personality profile after onboarding
// GET  /api/user/profile — fetch profile to inject into AI prompts

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
```

### 5.5 Injecting Personality Into Every AI Call

This is the core mechanism. The `buildPersonalityContext()` function converts the user's profile into a system instruction fragment that gets prepended to every Gemini prompt:

```javascript
// In server/services/geminiService.js

// ── PERSONALITY CONTEXT BUILDER ───────────────────────────────────────────────
export function buildPersonalityContext(profile) {
  if (!profile) return ''; // Graceful fallback — no personalization if no profile yet

  const toneInstructions = {
    friendly: 'Use warm, encouraging language. Celebrate small wins. Use "you" directly.',
    direct: 'Be concise and precise. No filler phrases. Lead with the key point.',
    socratic: 'Pose guiding questions within your explanation to prompt the user to think. Do not just state facts.',
    formal: 'Use academic, precise language. Reference concepts formally. Avoid contractions.',
  };

  const levelInstructions = {
    beginner: 'Assume zero prior knowledge. Define every technical term when first used. Use simple analogies.',
    intermediate: 'Assume basic familiarity. Skip foundational definitions. Focus on "why" not just "what".',
    advanced: 'Assume strong background. Use technical vocabulary freely. Focus on nuance and edge cases.',
    expert: 'Treat the user as a peer. Assume deep expertise. Surface only what is non-obvious.',
  };

  const styleInstructions = {
    visual: 'Structure explanations as if describing a diagram. Use spatial metaphors. Break into labeled sections.',
    reading: 'Write dense, well-structured prose. Use headers and sub-points. Prefer written depth.',
    kinesthetic: 'Ground every concept in a concrete example or worked problem. Lead with the example, explain after.',
    auditory: 'Write conversationally as if speaking out loud. Use rhythm and repetition naturally.',
  };

  const domainAnalogies = {
    computer_science: 'Use programming, systems, and algorithm analogies where possible.',
    medicine: 'Use clinical, biological, or patient-care analogies where possible.',
    business: 'Use business strategy, market, or financial analogies where possible.',
    humanities: 'Use historical, philosophical, or societal analogies where possible.',
  };

  return `
=== LEARNER PERSONALITY PROFILE ===
Expertise Level: ${profile.expertise_level}
→ ${levelInstructions[profile.expertise_level] || ''}

Communication Tone: ${profile.communication_tone}
→ ${toneInstructions[profile.communication_tone] || ''}

Learning Style: ${profile.learning_style}
→ ${styleInstructions[profile.learning_style] || ''}

Domain Context: ${profile.study_domain || 'general'}
→ ${domainAnalogies[profile.study_domain] || 'Use general-purpose analogies.'}

Preferred Session Length: ${profile.preferred_session_minutes} minutes
→ When estimating node time, bias toward chunks of approximately ${profile.preferred_session_minutes} minutes.
====================================
`;
}
```

Now inject this into **every** prompt function:

```javascript
// Updated generateRoadmapFromText
export async function generateRoadmapFromText(rawText, timeBudgetHours, userProfile) {
  const personalityContext = buildPersonalityContext(userProfile);

  const prompt = `
${personalityContext}

You are a strict educational architecture engine.
Adapt the depth, vocabulary, and framing of each node's summary to match the learner profile above.
The sum of ALL nodes' estimated_minutes MUST equal exactly ${timeBudgetHours * 60} minutes.
Bias each node's estimated_minutes toward multiples of ${userProfile?.preferred_session_minutes || 30} minutes.

Respond ONLY with valid JSON. No markdown, no prose.

{
  "roadmapTitle": "string",
  "nodes": [
    {
      "sequence_order": 1,
      "title": "string",
      "summary": "string — written at the learner's exact level and in their preferred style",
      "estimated_minutes": number
    }
  ]
}

Course Material:
${rawText}
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// Updated generateQuizQuestions
export async function generateQuizQuestions(nodeTitle, nodeSummary, userProfile) {
  const personalityContext = buildPersonalityContext(userProfile);

  const prompt = `
${personalityContext}

You are an active recall assessment engine.
Generate exactly 3 questions that test genuine understanding of the concept below.
Frame the questions using the learner's domain and tone preferences from the profile above.
For a 'socratic' tone: make questions probing and open-ended.
For a 'kinesthetic' style: make questions ask the user to solve a scenario, not just recite.
For a 'beginner' level: ask conceptual questions, not implementation details.

Respond ONLY with a JSON array of exactly 3 objects. No prose.

[
  { "q_id": 1, "question": "string" },
  { "q_id": 2, "question": "string" },
  { "q_id": 3, "question": "string" }
]

Concept Title: ${nodeTitle}
Concept Summary: ${nodeSummary}
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// Updated evaluateAnswers
export async function evaluateAnswers(nodeTitle, nodeSummary, userAnswers, userProfile) {
  const personalityContext = buildPersonalityContext(userProfile);
  const answersText = userAnswers.map(a => `Q${a.q_id}: ${a.answer}`).join('\n');

  const prompt = `
${personalityContext}

You are a strict but empathetic educational evaluator.
Grade the following answers. Adapt your feedback to the learner's communication tone and expertise level.
For 'encouraging' tone: frame gaps as "next steps", not failures.
For 'direct' tone: state the gap precisely in one sentence, no softening.
For 'beginner' level: explain what was missed in plain language with an example.

Score 0-100. If score < 70, provide a targeted remediation_node.

Respond ONLY with this exact JSON object. No prose.

{
  "score": number,
  "passed": boolean,
  "feedback": "string — personalized to the learner's profile",
  "remediation_node": {
    "title": "Remediation: [specific missing concept]",
    "summary": "string — re-explained at the learner's exact level and style",
    "estimated_minutes": 15
  }
}

Module: ${nodeTitle}
Summary: ${nodeSummary}

User Answers:
${answersText}
  `;

  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());
  if (parsed.passed) parsed.remediation_node = null;
  return parsed;
}
```

---

## 6. Feature B: Natural Language Analytics Dashboard

### 6.1 What This Feature Does

The user types a query in plain English like:

- *"Show me my quiz scores over time as a line chart"*
- *"Compare my performance across all roadmaps as a bar chart"*
- *"Which nodes took me the longest? Show as a horizontal bar"*
- *"Show the team's completion rate breakdown as a pie chart"*

Gemini interprets the query, fetches the right data from Supabase, and returns a **Recharts-compatible JSON config** that the frontend renders immediately.

This is architecturally similar to Notion AI's chart generation — the difference is our data is educational and personalized.

### 6.2 Analytics Data Fetcher (`server/services/analyticsService.js`)

```javascript
// Analytics service: NL query → Gemini interprets → SQL data → Recharts JSON config
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { responseMimeType: 'application/json' },
});

// ── STEP 1: Fetch all raw analytics data for a user ───────────────────────────
async function fetchUserAnalyticsData(userId) {
  // Quiz scores over time
  const { data: quizLogs } = await supabase
    .from('active_recall_logs')
    .select(`
      quiz_score,
      completed_at,
      node_id,
      nodes (title, estimated_minutes, roadmap_id,
        roadmaps (title)
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: true });

  // Node statuses for all roadmaps the user has access to
  const { data: nodeStatuses } = await supabase
    .from('nodes')
    .select(`
      status,
      estimated_minutes,
      title,
      roadmap_id,
      roadmaps!inner (title, owner_id)
    `)
    .or(`roadmaps.owner_id.eq.${userId}`);

  return { quizLogs: quizLogs || [], nodeStatuses: nodeStatuses || [] };
}

// ── STEP 2: Ask Gemini to interpret the NL query and build chart config ────────
export async function processAnalyticsQuery(nlQuery, userId, userProfile) {
  const rawData = await fetchUserAnalyticsData(userId);

  const prompt = `
You are a data analyst for an educational AI platform.
The user has asked: "${nlQuery}"

Here is their raw learning data as JSON:
${JSON.stringify(rawData, null, 2)}

Your job is to:
1. Identify which chart type best answers the question (line, bar, horizontalBar, pie, radar, area)
2. Extract and transform the relevant data from the raw data above
3. Return a Recharts-compatible configuration

CRITICAL: Respond ONLY with this exact JSON structure. No prose, no markdown.

{
  "chartType": "line" | "bar" | "horizontalBar" | "pie" | "radar" | "area",
  "title": "string — concise chart title answering the user's question",
  "description": "string — one sentence insight from the data",
  "data": [
    { "label": "string", "value": number, "secondaryValue": number | null }
  ],
  "xAxisLabel": "string",
  "yAxisLabel": "string",
  "color": "#6366f1"
}

Rules:
- "data" must have at least 2 data points to be meaningful
- "label" is what goes on the axis (e.g. node title, date, roadmap name)
- "value" is the primary metric (e.g. score, minutes, count)
- If no relevant data exists, set "data" to [] and explain in "description"
- For pie charts, "value" represents the slice size
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

### 6.3 Analytics Route (`server/routes/analytics.js`)

```javascript
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
```

### 6.4 Chart Renderer Component (`client/src/components/analytics/ChartRenderer.jsx`)

```jsx
// Dynamic Recharts renderer: maps Gemini's chartType string to the correct Recharts component
import {
  LineChart, BarChart, PieChart, RadarChart, AreaChart,
  Line, Bar, Pie, Radar, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PolarGrid, PolarAngleAxis, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

// Transform Gemini's generic data format to Recharts' expected format
function transformData(data) {
  return data.map(d => ({
    name: d.label,
    value: d.value,
    secondary: d.secondaryValue,
  }));
}

export default function ChartRenderer({ config }) {
  if (!config || !config.data || config.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        {config?.description || 'No data available for this query.'}
      </div>
    );
  }

  const data = transformData(config.data);
  const color = config.color || '#6366f1';

  const commonProps = {
    data,
    margin: { top: 5, right: 20, left: 0, bottom: 5 },
  };

  const renderChart = () => {
    switch (config.chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color }} />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'horizontalBar':
        return (
          <BarChart {...commonProps} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} width={120} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius={100} data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Radar name="Score" dataKey="value" stroke={color} fill={color} fillOpacity={0.3} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
          </RadarChart>
        );

      default:
        return <p className="text-gray-400 text-sm">Unknown chart type: {config.chartType}</p>;
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-white font-semibold mb-1">{config.title}</h3>
      <p className="text-gray-400 text-xs mb-6">{config.description}</p>
      <ResponsiveContainer width="100%" height={280}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
```

### 6.5 Analytics Dashboard Component (`client/src/components/analytics/AnalyticsDashboard.jsx`)

```jsx
// Analytics dashboard: NL query bar + chart grid + preset quick queries
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Loader2 } from 'lucide-react';
import axios from 'axios';
import ChartRenderer from './ChartRenderer';
import { useAuth } from '../../hooks/useAuth';

const PRESET_QUERIES = [
  'Show my quiz scores over time as a line chart',
  'Compare my scores across all roadmaps as a bar chart',
  'Which nodes did I spend the most time on? Show horizontal bars',
  'Show my node completion status breakdown as a pie chart',
];

export default function AnalyticsDashboard() {
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runQuery = async (q) => {
    const activeQuery = q || query;
    if (!activeQuery.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/analytics/query`,
        { query: activeQuery },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      // Prepend new charts at the top
      setCharts(prev => [{ ...data.chart, query: activeQuery }, ...prev]);
      setQuery('');
    } catch (err) {
      setError(err.response?.data?.error || 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <BarChart2 className="text-indigo-400 w-6 h-6" />
        <h2 className="text-2xl font-bold text-white">Learning Analytics</h2>
      </div>

      {/* NL Query Bar */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runQuery()}
          placeholder='Ask anything... e.g. "Show my progress as a line chart"'
          className="flex-1 px-5 py-3 bg-gray-800 text-white rounded-xl border border-gray-600 
            focus:border-indigo-500 outline-none placeholder-gray-500"
        />
        <button
          onClick={() => runQuery()}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 
            text-white font-medium rounded-xl transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
        </button>
      </div>

      {/* Preset quick queries */}
      <div className="flex flex-wrap gap-2 mb-8">
        {PRESET_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => runQuery(q)}
            className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 
              rounded-full border border-gray-600 transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {/* Chart grid */}
      <AnimatePresence>
        {charts.map((chart, i) => (
          <motion.div
            key={`${chart.query}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-gray-500 text-xs mb-2 italic">"{chart.query}"</p>
            <ChartRenderer config={chart} />
          </motion.div>
        ))}
      </AnimatePresence>

      {charts.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-600">
          <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Ask a question above to visualize your learning data.</p>
        </div>
      )}
    </div>
  );
}
```

---

## 7. Feature C: Multi-User Collaboration (Real-Time)

### 7.1 The Collaboration Model

```
OWNER creates a roadmap → enables "Collaborative Mode" toggle
       ↓
OWNER invites collaborators by email → they get a role (editor / viewer)
       ↓
EDITORS can: click nodes, take quizzes, mark nodes complete
VIEWERS can: see the tree, read summaries, view others' progress
       ↓
All node status changes broadcast via Supabase Realtime → all collaborators see live updates
       ↓
On collaborative roadmaps: each node shows avatar of the assigned user
       ↓
Node comments allow async discussion (like Google Docs inline comments)
```

### 7.2 Collaboration Route (`server/routes/collab.js`)

```javascript
// Collaboration routes: invite by email, fetch collaborators, assign nodes
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

// POST /api/collab/invite — owner invites a user by email to a roadmap
router.post('/invite', requireAuth, async (req, res) => {
  try {
    const { roadmap_id, invitee_email, role } = req.body;

    // Verify the requester is the owner
    const { data: roadmap } = await supabase
      .from('roadmaps')
      .select('owner_id')
      .eq('id', roadmap_id)
      .single();

    if (roadmap.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the roadmap owner can invite collaborators' });
    }

    // Look up the invitee's user ID by email
    const { data: invitee } = await supabase
      .from('users')
      .select('id')
      .eq('email', invitee_email)
      .single();

    if (!invitee) {
      return res.status(404).json({ error: 'No account found for that email' });
    }

    // Add to collaborators table
    const { data, error } = await supabase
      .from('roadmap_collaborators')
      .upsert({
        roadmap_id,
        user_id: invitee.id,
        role: role || 'viewer',
      })
      .select()
      .single();

    if (error) throw error;

    // Enable collaborative mode on the roadmap
    await supabase.from('roadmaps').update({ is_collaborative: true }).eq('id', roadmap_id);

    res.json({ collaborator: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/collab/:roadmap_id — list all collaborators with user details
router.get('/:roadmap_id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('roadmap_collaborators')
      .select(`
        role,
        joined_at,
        users (id, email, display_name, avatar_url)
      `)
      .eq('roadmap_id', req.params.roadmap_id);

    if (error) throw error;
    res.json({ collaborators: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/collab/node/assign — assign a node to a specific user
router.patch('/node/assign', requireAuth, async (req, res) => {
  try {
    const { node_id, assigned_to } = req.body;
    const { error } = await supabase
      .from('nodes')
      .update({ assigned_to, last_updated_by: req.user.id, updated_at: new Date().toISOString() })
      .eq('id', node_id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collab/comment — add a comment to a node
router.post('/comment', requireAuth, async (req, res) => {
  try {
    const { node_id, content } = req.body;
    const { data, error } = await supabase
      .from('node_comments')
      .insert({ node_id, user_id: req.user.id, content })
      .select(`*, users (display_name, avatar_url)`)
      .single();
    if (error) throw error;
    res.json({ comment: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

### 7.3 Realtime Hook (`client/src/hooks/useRealtime.js`)

This is the key hook that makes the tree update live for all collaborators without any page refresh.

```javascript
// Supabase Realtime hook: subscribes to node changes and comment changes for a roadmap
import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtime(roadmapId, { onNodeUpdate, onCommentAdded }) {
  useEffect(() => {
    if (!roadmapId) return;

    // Create a single channel for this roadmap
    const channel = supabase
      .channel(`roadmap-${roadmapId}`)
      // Listen to any UPDATE on nodes in this roadmap
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'nodes',
          filter: `roadmap_id=eq.${roadmapId}`,
        },
        (payload) => {
          console.log('Node updated by collaborator:', payload.new);
          onNodeUpdate(payload.new); // Pass the updated node to parent state
        }
      )
      // Listen to INSERT on nodes (remediation nodes from other users)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'nodes',
          filter: `roadmap_id=eq.${roadmapId}`,
        },
        (payload) => {
          console.log('New node inserted:', payload.new);
          onNodeUpdate(payload.new);
        }
      )
      // Listen to new comments
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'node_comments',
        },
        (payload) => {
          console.log('New comment:', payload.new);
          if (onCommentAdded) onCommentAdded(payload.new);
        }
      )
      .subscribe();

    // Cleanup: unsubscribe when component unmounts or roadmapId changes
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roadmapId]);
}
```

Usage in `App.jsx`:

```javascript
const [nodes, setNodes] = useState([]);

// Handle live node updates from collaborators
const handleNodeUpdate = useCallback((updatedNode) => {
  setNodes(prev =>
    prev.some(n => n.id === updatedNode.id)
      ? prev.map(n => n.id === updatedNode.id ? updatedNode : n)
      : [...prev, updatedNode] // New remediation node inserted
  );
}, []);

useRealtime(currentRoadmap?.id, {
  onNodeUpdate: handleNodeUpdate,
  onCommentAdded: (comment) => setComments(prev => [...prev, comment]),
});
```

### 7.4 Collaborator Sidebar (`client/src/components/collab/CollabSidebar.jsx`)

```jsx
// Collaboration panel: shows active members, roles, invite form, node assignment
import { useState, useEffect } from 'react';
import { Users, UserPlus, Crown, Eye, Pencil } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const ROLE_ICONS = {
  owner: <Crown className="w-4 h-4 text-yellow-400" />,
  editor: <Pencil className="w-4 h-4 text-indigo-400" />,
  viewer: <Eye className="w-4 h-4 text-gray-400" />,
};

export default function CollabSidebar({ roadmapId, ownerId }) {
  const { session, user } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState(null);

  const isOwner = user?.id === ownerId;

  useEffect(() => {
    fetchCollaborators();
  }, [roadmapId]);

  const fetchCollaborators = async () => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/collab/${roadmapId}`,
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    );
    setCollaborators(data.collaborators || []);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/collab/invite`,
        { roadmap_id: roadmapId, invitee_email: inviteEmail, role: inviteRole },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setInviteEmail('');
      fetchCollaborators();
    } catch (err) {
      setError(err.response?.data?.error || 'Invite failed');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-700 p-5 flex flex-col gap-6 h-full">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-indigo-400" />
        <h3 className="text-white font-semibold">Collaborators</h3>
      </div>

      {/* Collaborator list */}
      <div className="space-y-3">
        {collaborators.map((c) => (
          <div key={c.users.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold">
              {c.users.display_name?.[0] || c.users.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{c.users.display_name || c.users.email}</p>
              <p className="text-xs text-gray-500">{c.role}</p>
            </div>
            {ROLE_ICONS[c.role]}
          </div>
        ))}
      </div>

      {/* Invite form — only visible to owner */}
      {isOwner && (
        <div className="space-y-3 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Invite teammate
          </p>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="teammate@email.com"
            className="w-full px-3 py-2 text-sm bg-gray-800 text-white rounded-lg border border-gray-600 
              focus:border-indigo-500 outline-none"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-800 text-white rounded-lg border border-gray-600 
              focus:border-indigo-500 outline-none"
          >
            <option value="editor">Editor — can take quizzes</option>
            <option value="viewer">Viewer — read-only</option>
          </select>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={handleInvite}
            disabled={inviting}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 
              text-white text-sm rounded-lg transition-all"
          >
            {inviting ? 'Inviting...' : 'Send Invite'}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 8. Updated AI Prompt Engineering Contracts

### Summary of All Gemini Functions and Their Contracts

| Function | Input | Output Schema | Personality-Aware? |
|---|---|---|---|
| `generateRoadmapFromText` | raw text, hours, profile | `{ roadmapTitle, nodes[] }` | ✅ Yes |
| `generateQuizQuestions` | title, summary, profile | `[{ q_id, question }]` × 3 | ✅ Yes |
| `evaluateAnswers` | title, summary, answers[], profile | `{ score, passed, feedback, remediation_node }` | ✅ Yes |
| `processAnalyticsQuery` | NL query string, raw data JSON, profile | `{ chartType, title, description, data[], xAxisLabel, yAxisLabel, color }` | ✅ Insight framing |

### Key Prompt Engineering Rules (Do Not Break These)

```javascript
// RULE 1: Always use responseMimeType for all model instances
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { responseMimeType: 'application/json' },
});

// RULE 2: Always inject personalityContext FIRST in every prompt
const prompt = `
${personalityContext}      // ← Always first

You are a [role]...        // ← Then role definition
[Your task instructions]   // ← Then task
[Output schema]            // ← Then schema
[Data/input]               // ← Last
`;

// RULE 3: Validate structure immediately after parse
const parsed = JSON.parse(result.response.text());
if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
  throw new Error('Gemini returned invalid structure');
}

// RULE 4: Safety override — always null remediation when passed
if (parsed.passed) parsed.remediation_node = null;
```

---

## 9. Backend — All Routes Reference

```javascript
// server/index.js — register all routers
import userRouter from './routes/user.js';
import roadmapRouter from './routes/roadmap.js';
import nodeRouter from './routes/node.js';
import analyticsRouter from './routes/analytics.js';
import collabRouter from './routes/collab.js';

app.use('/api/user', userRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/node', nodeRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/collab', collabRouter);
```

---

## 10. Frontend — All Components Reference

### Auth Flow in `App.jsx`

```jsx
// App.jsx — top-level auth gate and onboarding check
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import LoginForm from './components/auth/LoginForm';
import PersonalityOnboarding from './components/auth/PersonalityOnboarding';
import Dashboard from './components/Dashboard'; // Main app layout

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session);
      else setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session);
    });
  }, []);

  const fetchProfile = async (sess) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${sess.access_token}` },
    });
    const { profile } = await res.json();
    setProfile(profile); // null means onboarding needed
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!session) return <LoginForm />;
  if (profile === null) return <PersonalityOnboarding user={session} onComplete={setProfile} />;
  return <Dashboard session={session} profile={profile} />;
}
```

### `LoginForm.jsx` — Supabase Auth

```jsx
// Supabase email/password login with OAuth Google button
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const { error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 w-full max-w-sm space-y-5">
        <h1 className="text-3xl font-bold text-white text-center">Pulse-Learn AI</h1>
        <p className="text-gray-400 text-center text-sm">Your personalized learning engine</p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-600 outline-none focus:border-indigo-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-600 outline-none focus:border-indigo-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
        </button>

        <button
          onClick={handleGoogle}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all"
        >
          Continue with Google
        </button>

        <p
          onClick={() => setIsSignup(!isSignup)}
          className="text-center text-gray-400 text-sm cursor-pointer hover:text-indigo-400"
        >
          {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </p>
      </div>
    </div>
  );
}
```

---

## 11. Supabase Realtime Setup

Realtime needs to be explicitly enabled per table in Supabase.

### In Supabase Dashboard:

1. Go to **Database → Replication**
2. Under **Source**, find **supabase_realtime** publication
3. Toggle ON: `nodes`, `node_comments`, `roadmap_collaborators`

Or use the SQL in Section 4 (`ALTER PUBLICATION supabase_realtime ADD TABLE nodes;`).

### Presence (Who Is Viewing Which Node)

For a lightweight "User X is viewing Node Y" presence indicator without any extra DB writes, use Supabase's built-in Presence API:

```javascript
// In useRealtime.js — add Presence tracking
const channel = supabase
  .channel(`roadmap-${roadmapId}`, {
    config: { presence: { key: userId } },
  })
  // ... postgres_changes subscriptions from above ...
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      // Broadcast which node you're currently viewing
      await channel.track({
        user_id: userId,
        display_name: user.display_name,
        viewing_node_id: null,
      });
    }
  });

// Call this when a user clicks a node
const trackNodeView = async (nodeId) => {
  await channel.track({ user_id: userId, viewing_node_id: nodeId });
};

// Listen to who else is present
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState();
  const presenceList = Object.values(state).flat();
  onPresenceUpdate(presenceList); // Pass to PresenceBar component
});
```

---

## 12. Stellar Blockchain Module (Unchanged)

Refer to **PRD v1, Section 7**. No changes to this module in v2.

The only integration point to update: the `/api/roadmap/:id/complete` route now accepts the JWT and verifies ownership via `requireAuth` middleware before triggering the mint.

---

## 13. Full API Contract Table

| Method | Route | Auth Required | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/user/profile` | ✅ | — | `{ profile }` or `{ profile: null }` |
| `POST` | `/api/user/profile` | ✅ | `{ learning_style, expertise_level, communication_tone, study_domain, preferred_session_minutes }` | `{ profile }` |
| `POST` | `/api/roadmap/generate` | ✅ | `file, time_budget_hours, target_date` | `{ roadmap: { ...roadmap, nodes[] } }` |
| `GET` | `/api/roadmap/:id` | ✅ | — | `{ roadmap: { ...roadmap, nodes[] } }` |
| `POST` | `/api/roadmap/:id/complete` | ✅ | `{ final_score }` | `{ stellar_tx_hash }` |
| `POST` | `/api/node/quiz` | ✅ | `{ node_id }` | `{ questions: [{ q_id, question }] × 3 }` |
| `POST` | `/api/node/verify` | ✅ | `{ node_id, roadmap_id, user_answers[], node_title, node_summary, sequence_order }` | `{ passed, score, feedback, mutation_triggered, new_remediation_node }` |
| `POST` | `/api/analytics/query` | ✅ | `{ query: "string" }` | `{ chart: { chartType, title, description, data[], ... } }` |
| `POST` | `/api/collab/invite` | ✅ (owner only) | `{ roadmap_id, invitee_email, role }` | `{ collaborator }` |
| `GET` | `/api/collab/:roadmap_id` | ✅ | — | `{ collaborators[] }` |
| `PATCH` | `/api/collab/node/assign` | ✅ | `{ node_id, assigned_to }` | `{ success: true }` |
| `POST` | `/api/collab/comment` | ✅ | `{ node_id, content }` | `{ comment }` |

---

## 14. Edge Cases & Mitigations

### Edge Case 1 — User Has No Profile Yet (Analytics Crash)

- **Problem:** `buildPersonalityContext(null)` would throw if profile is null.
- **Mitigation:** `buildPersonalityContext` returns `''` if profile is falsy. All prompts still work, just without personalization.

### Edge Case 2 — Gemini Returns Wrong Chart Type

- **Problem:** Gemini returns `"chartType": "scatter"` which isn't in ChartRenderer's switch.
- **Mitigation:** `ChartRenderer`'s `default` case renders an error message instead of crashing. Also add a fallback:

```javascript
// In analyticsService.js — validate chartType before returning
const VALID_TYPES = ['line', 'bar', 'horizontalBar', 'pie', 'radar', 'area'];
if (!VALID_TYPES.includes(parsed.chartType)) {
  parsed.chartType = 'bar'; // Fallback to bar chart
}
```

### Edge Case 3 — Collaborator Conflict (Two Users Completing Same Node Simultaneously)

- **Problem:** Both User A and User B click "Complete" on Node 3 at the same time. Two writes fire. The second write to `unlockNextNode` is idempotent (UPDATE WHERE sequence_order = 4), so it just runs twice harmlessly. But two `active_recall_logs` rows get inserted.
- **Mitigation:** This is acceptable for MVP. Add a unique constraint post-hackathon: `UNIQUE(user_id, node_id)` on `active_recall_logs`.

### Edge Case 4 — Realtime Subscription on Page Refresh

- **Problem:** After a page refresh, the Realtime channel reconnects but may have missed events during the gap.
- **Mitigation:** On every mount, `useRealtime` calls `getRoadmapWithNodes` first to get the ground-truth state, then subscribes. Live events only patch the already-accurate state.

### Edge Case 5 — Empty Analytics Query

- **Problem:** User types "hi" or submits empty query.
- **Mitigation:** Backend checks `query.trim().length < 5` and returns 400. Frontend disables the Generate button when input is empty.

### Edge Case 6 — Viewer Tries to Submit a Quiz

- **Problem:** A `viewer` role user shouldn't be able to call `/api/node/verify`.
- **Mitigation:** Add a role check in the verify route:

```javascript
// In node.js verify route
const { data: membership } = await supabase
  .from('roadmap_collaborators')
  .select('role')
  .eq('roadmap_id', roadmap_id)
  .eq('user_id', req.user.id)
  .single();

if (membership && membership.role === 'viewer') {
  return res.status(403).json({ error: 'Viewers cannot submit quizzes' });
}
```

---

## 15. Environment Variables Reference

**`server/.env`**

```env
PORT=3001
CLIENT_URL=http://localhost:5173

# Supabase — use service role for all server-side operations
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Gemini
GEMINI_API_KEY=AIza...

# Stellar Testnet
STELLAR_SECRET_KEY=S...
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> **Note:** Never put `SUPABASE_SERVICE_ROLE_KEY` in the client. It gives full database access. The client only ever uses the `ANON_KEY`.

---

## 16. Deployment Checklist

### Google Gemini — Enable OAuth in Supabase (for Google login)

1. In Supabase → **Authentication → Providers → Google**
2. Add your Google Cloud OAuth Client ID and Secret
3. Add `https://your-project.supabase.co/auth/v1/callback` as an authorized redirect URI in Google Cloud Console

### Backend → Render

1. Push `server/` to GitHub
2. Render → New Web Service → Root Directory: `server`
3. Build: `npm install`, Start: `node index.js`
4. Add all server env vars in Render's Environment tab
5. Note the Render URL

### Frontend → Vercel

1. Push `client/` to GitHub
2. Vercel → New Project → Root Directory: `client`, Framework: Vite
3. Set `VITE_API_URL` = Render URL, add other VITE_ vars
4. Deploy

### Supabase Realtime

Confirm in **Database → Replication** that `nodes`, `node_comments`, and `roadmap_collaborators` are toggled on under the `supabase_realtime` publication.

---

## 17. GitHub Copilot Prompt Cheatsheet v2

Paste these as the **first comment in the file** to get Copilot scaffolding:

| File | Opening Trigger Comment |
|---|---|
| `server/middleware/auth.js` | `// Supabase JWT verification middleware: extracts user from Bearer token, attaches to req.user` |
| `server/routes/user.js` | `// Express routes for user personality profile: GET and POST /api/user/profile using Supabase service role client` |
| `server/services/geminiService.js` | `// Gemini 1.5 Flash service with responseMimeType json. Functions: buildPersonalityContext, generateRoadmapFromText, generateQuizQuestions, evaluateAnswers. All functions accept userProfile param.` |
| `server/services/analyticsService.js` | `// Analytics service: fetches active_recall_logs and nodes from Supabase, sends data to Gemini, returns Recharts-compatible chart config JSON` |
| `server/routes/analytics.js` | `// POST /api/analytics/query — authenticated route that takes a natural language query string and returns a Recharts chart config` |
| `server/routes/collab.js` | `// Collaboration routes: invite by email, list collaborators, assign node to user, post comment — all protected by requireAuth` |
| `client/src/hooks/useRealtime.js` | `// Supabase Realtime hook: subscribes to postgres_changes on nodes and node_comments tables filtered by roadmapId` |
| `client/src/hooks/useAuth.js` | `// Custom React hook wrapping Supabase auth session with getSession and onAuthStateChange listener` |
| `client/src/components/analytics/ChartRenderer.jsx` | `// Dynamic Recharts renderer component: maps chartType string (line, bar, horizontalBar, pie, radar, area) to correct Recharts chart using ResponsiveContainer` |
| `client/src/components/collab/CollabSidebar.jsx` | `// Collaboration sidebar: lists collaborators with roles, invite form for owners, role-based icon display` |
| `client/src/components/auth/PersonalityOnboarding.jsx` | `// Multi-step onboarding wizard with 5 steps: expertise level, learning style, communication tone, study domain, preferred session length` |
| `client/src/App.jsx` | `// Top-level auth gate: checks Supabase session, fetches user profile, routes to LoginForm, PersonalityOnboarding, or Dashboard based on state` |

---

*PRD Version 2.0 — Pulse-Learn AI — Built for Hackathon Sprint*  
*Adds: Personality-Driven Personalization + Natural Language Analytics + Multi-User Real-Time Collaboration*
