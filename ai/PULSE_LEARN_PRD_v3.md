# Product Requirement Document (PRD) — Version 3.0
## Pulse-Learn AI — Adaptive AI Learning OS with MBTI Intelligence, Unified Block Workspace & Stellar Credentials

**Version:** 3.0  
**Builds on:** v2.0 (Auth, Personalization, Analytics, Collaboration)  
**New in v3:** MBTI Cognitive Engine · Unified Block Workspace (Loop/Notion Model) · Market Differentiation Layer  
**Primary IDE:** VSCode with GitHub Copilot  

---

## Table of Contents

1. [What Changed in v3 — The Upgrade Map](#1-what-changed-in-v3--the-upgrade-map)
2. [Market Positioning — Why This Is Not Ollama](#2-market-positioning--why-this-is-not-ollama)
3. [Full Tech Stack & New Dependencies](#3-full-tech-stack--new-dependencies)
4. [Updated Folder Structure](#4-updated-folder-structure)
5. [Database Schema — Full v3](#5-database-schema--full-v3)
6. [Feature A: MBTI Cognitive Personality Engine](#6-feature-a-mbti-cognitive-personality-engine)
7. [Feature B: Unified Block Workspace (The Loop/Notion Model)](#7-feature-b-unified-block-workspace-the-loopnotion-model)
8. [Feature C: AI Differentiation Layer — What Nobody Else Does](#8-feature-c-ai-differentiation-layer--what-nobody-else-does)
9. [Updated AI Prompt Engineering Contracts](#9-updated-ai-prompt-engineering-contracts)
10. [Backend — All Routes v3](#10-backend--all-routes-v3)
11. [Frontend — All Components v3](#11-frontend--all-components-v3)
12. [Supabase Realtime & Workspace Sync](#12-supabase-realtime--workspace-sync)
13. [Full API Contract Table v3](#13-full-api-contract-table-v3)
14. [Edge Cases & Mitigations v3](#14-edge-cases--mitigations-v3)
15. [Environment Variables](#15-environment-variables)
16. [Deployment Checklist](#16-deployment-checklist)
17. [GitHub Copilot Prompt Cheatsheet v3](#17-github-copilot-prompt-cheatsheet-v3)

---

## 1. What Changed in v3 — The Upgrade Map

| Dimension | v2 | v3 |
|---|---|---|
| **Personality system** | 5-question dropdown wizard | Full 20-question MBTI forced-choice test, taken once at signup, produces a cognitive type profile |
| **AI personalization** | Learning style + tone labels | MBTI type drives 16 distinct AI instruction sets — vocabulary depth, reasoning style, motivation framing |
| **UI architecture** | Separate pages (Tree, Quiz, Analytics) | Single unified block canvas — insert any block (Skill Tree, Chart, Table, Quiz, Notes, Progress) into one workspace |
| **Workspace model** | Multi-page SPA | Slash-command block system (type `/` to insert blocks) — like Microsoft Loop meets Notion AI |
| **Market identity** | Generic AI tutor | Positioned as a **Learning OS** — not a chatbot, not a course player, not a local model runner |
| **Differentiators** | Blockchain credential | + MBTI AI cognition layer + live mutation engine + workspace composability + team learning pods |

---

## 2. Market Positioning — Why This Is Not Ollama

This section exists because the team needs to answer "how is this different from X?" confidently.

### The Positioning Matrix

| Tool | Category | What It Does | What It Doesn't Do |
|---|---|---|---|
| **Ollama** | Local LLM runner | Runs open-source models (Llama, Mistral) on your own hardware | Has no educational logic, no curriculum, no quiz engine, no adaptive path, no blockchain, no workspace |
| **ChatGPT / Claude** | General-purpose AI chat | Answers any question conversationally | Stateless — forgets everything, no skill tree, no scoring, no credential, no live collaboration |
| **Notion AI** | Writing assistant inside a doc tool | Summarizes, writes, edits text in a document | Not a learning engine — no adaptive path, no cognitive profiling, no quiz evaluation |
| **Microsoft Loop** | Shared collaborative canvas | Live blocks across Microsoft apps | Not educational — no AI quiz engine, no cognitive personalization, no blockchain verification |
| **Coursera / EdX** | Online course platform | Pre-built video courses + certificates | Static content, no adaptation to user's learning style, certificates are centralized and not verifiable on-chain |
| **Duolingo** | Gamified language learning | Spaced repetition for language only | Language domain locked, no custom syllabus upload, no team/collaborative learning |
| **Khan Academy Khanmigo** | AI tutoring inside Khan's content | Q&A on Khan's own content | Locked to Khan's curriculum — cannot take your own PDF and generate an adaptive path |
| **Anki** | Flashcard spaced repetition | Manual card creation, proven recall system | No AI, no adaptive path mutation, no blockchain, no collaborative workspace |

### Pulse-Learn's Unique Capability Stack (What No Other Tool Has Simultaneously)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PULSE-LEARN'S DEFENSIBLE MOAT                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Bring Your Own Syllabus → AI generates a personalized adaptive path     │
│     (No other tool converts YOUR document into a live mutation engine)      │
├─────────────────────────────────────────────────────────────────────────────┤
│  2. MBTI-Cognitive AI Layer → The AI thinks in your cognitive language      │
│     (No other EdTech product adapts to Myers-Briggs type at the prompt level│
├─────────────────────────────────────────────────────────────────────────────┤
│  3. Live Path Mutation → The curriculum rewrites itself when you fail       │
│     (Coursera's path doesn't change. Duolingo is linear. Anki is manual.)  │
├─────────────────────────────────────────────────────────────────────────────┤
│  4. Team Learning Pods → Multiple people collaborate on ONE skill tree      │
│     (No tool combines Google Docs-style collab with adaptive quiz engines)  │
├─────────────────────────────────────────────────────────────────────────────┤
│  5. Blockchain-Anchored Proof of Knowledge → Tamper-proof credential        │
│     (Coursera certs are centralized. Stellar TX hash is publicly verifiable)│
├─────────────────────────────────────────────────────────────────────────────┤
│  6. Unified Block Workspace → Everything in one composable canvas           │
│     (Microsoft Loop has blocks. Notion has blocks. Neither has an AI        │
│      quiz engine that mutates a skill tree inside those same blocks.)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The One-Sentence Pitch

> "Pulse-Learn is the world's first **Learning OS** — it converts any document into a cognitively personalized, live-mutating skill tree that a team can work on together in a single composable workspace, and anchors every completion permanently on the blockchain."

**Ollama** runs a model. **ChatGPT** answers a question. **Pulse-Learn** builds you a curriculum, learns how your brain works, adapts it in real-time, lets your team work on it together, and gives you a credential nobody can fake.

---

## 3. Full Tech Stack & New Dependencies

### Backend

```bash
cd server
npm install express cors multer dotenv @supabase/supabase-js \
  @google/generative-ai @stellar/stellar-sdk pdf-parse uuid
```

No new backend dependencies from v2. All new features (MBTI engine, workspace blocks) are handled by new service functions and routes using the same stack.

### Frontend

```bash
cd client
npm install tailwindcss @tailwindcss/vite lucide-react framer-motion \
  @supabase/supabase-js axios recharts react-confetti \
  @tiptap/react @tiptap/pm @tiptap/starter-kit \
  react-grid-layout react-resizable
```

**New packages:**

| Package | Why |
|---|---|
| `@tiptap/react` + `@tiptap/starter-kit` | Rich text editor for the Notes block inside the workspace canvas. Tiptap is Notion-style block-based editing |
| `react-grid-layout` | Drag-and-drop, resizable block grid for the unified workspace canvas |
| `react-resizable` | Peer dependency for `react-grid-layout` |

---

## 4. Updated Folder Structure

Only new or changed files are marked with `← NEW` or `← UPDATED`.

```
pulse-learn/
├── client/src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── MBTITest.jsx               ← NEW (replaces PersonalityOnboarding)
│   │   ├── workspace/                     ← NEW DIRECTORY
│   │   │   ├── WorkspaceCanvas.jsx        ← NEW (the Loop/Notion unified canvas)
│   │   │   ├── BlockPalette.jsx           ← NEW (slash-command block selector)
│   │   │   ├── blocks/
│   │   │   │   ├── SkillTreeBlock.jsx     ← NEW (skill tree as a resizable block)
│   │   │   │   ├── ChartBlock.jsx         ← NEW (analytics chart as a block)
│   │   │   │   ├── TableBlock.jsx         ← NEW (node data as a sortable table)
│   │   │   │   ├── QuizBlock.jsx          ← NEW (inline quiz as a block)
│   │   │   │   ├── NotesBlock.jsx         ← NEW (Tiptap rich text notes)
│   │   │   │   ├── ProgressBlock.jsx      ← NEW (progress ring / stats summary)
│   │   │   │   └── MBTIInsightBlock.jsx   ← NEW (live cognitive profile display)
│   │   ├── collab/
│   │   │   ├── CollabSidebar.jsx
│   │   │   └── PresenceBar.jsx
│   │   ├── StellarModal.jsx
│   │   └── UploadForm.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useRoadmap.js
│   │   ├── useQuiz.js
│   │   ├── useRealtime.js
│   │   ├── useAnalytics.js
│   │   └── useWorkspace.js                ← NEW (block layout state + persistence)
│   ├── lib/
│   │   ├── supabaseClient.js
│   │   ├── mbtiProfiles.js                ← NEW (16 MBTI type → AI instruction maps)
│   │   └── chartTypes.js
│   ├── App.jsx                            ← UPDATED (MBTI gate added)
│   └── main.jsx
│
├── server/
│   ├── routes/
│   │   ├── roadmap.js
│   │   ├── node.js
│   │   ├── analytics.js
│   │   ├── collab.js
│   │   ├── user.js                        ← UPDATED (MBTI result storage)
│   │   └── workspace.js                   ← NEW (block layout persistence)
│   ├── services/
│   │   ├── geminiService.js               ← UPDATED (MBTI context replaces old profile)
│   │   ├── mbtiService.js                 ← NEW (MBTI scoring engine)
│   │   ├── supabaseService.js
│   │   ├── analyticsService.js
│   │   └── stellarService.js
│   ├── middleware/
│   │   ├── upload.js
│   │   └── auth.js
│   └── index.js                           ← UPDATED (workspace route added)
```

---

## 5. Database Schema — Full v3

Run this in the Supabase SQL editor. It extends v2 with 2 new tables.

```sql
-- ── EXTEND user_profiles for MBTI ────────────────────────────────────────────
-- Drop the v2 user_profiles table and replace with the MBTI-aware version.
-- If you're starting fresh, just use the CREATE TABLE below.
-- If migrating from v2, use ALTER TABLE to add the mbti_type column.

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

    -- MBTI result (the 4-letter type, computed from test answers)
    mbti_type TEXT,
    -- One of: 'INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
    --         'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'

    -- Raw dimension scores (stored so we can re-derive type or show breakdown)
    ei_score INT DEFAULT 0,  -- Positive = Extravert, Negative = Introvert
    sn_score INT DEFAULT 0,  -- Positive = iNtuitive, Negative = Sensing
    tf_score INT DEFAULT 0,  -- Positive = Feeling, Negative = Thinking
    jp_score INT DEFAULT 0,  -- Positive = Perceiving, Negative = Judging

    -- Retained from v2 for non-MBTI contexts (analytics domain, session length)
    study_domain TEXT DEFAULT NULL,
    preferred_session_minutes INT DEFAULT 30,
    weekly_hours_available INT DEFAULT 10,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: users can only access their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);


-- ── WORKSPACE LAYOUTS ─────────────────────────────────────────────────────────
-- Persists the block layout of each user's workspace per roadmap.
-- layout_json stores the react-grid-layout config array.
CREATE TABLE workspace_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Full react-grid-layout JSON: array of { i, x, y, w, h, type, config }
    layout_json JSONB NOT NULL DEFAULT '[]'::jsonb,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(roadmap_id, user_id)  -- One layout per user per roadmap
);

ALTER TABLE workspace_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own layouts" ON workspace_layouts
  FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime on workspace layouts for collaborative layout sync
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_layouts;


-- ── ALL OTHER TABLES FROM v2 (copy unchanged) ────────────────────────────────
-- users, roadmaps, roadmap_collaborators, nodes, active_recall_logs,
-- node_comments — all identical to v2 schema. Keep them as-is.
```

---

## 6. Feature A: MBTI Cognitive Personality Engine

### 6.1 Why MBTI Instead of Generic Style Questions

The v2 onboarding asked "how do you learn best?" — which is self-reported and shallow. MBTI forces cognitive preference choices (neither option is wrong), giving us a theoretically grounded profile across 4 dimensions:

| Dimension | What It Measures | AI Impact |
|---|---|---|
| **E/I** — Extraversion / Introversion | Social orientation of thinking | Extraverts: collaborative framing, social examples. Introverts: solo deep-dive framing, internal reflection prompts |
| **S/N** — Sensing / iNtuition | Information processing style | Sensors: concrete facts first, step-by-step. iNtuitives: patterns, theory, big picture first |
| **T/F** — Thinking / Feeling | Decision-making basis | Thinkers: logical frameworks, pros/cons. Feelers: human impact, narrative, purpose-driven framing |
| **J/P** — Judging / Perceiving | Structure preference | Judgers: clear milestones, structured path. Perceivers: flexible, exploratory, open-ended |

### 6.2 The MBTI Test (`server/services/mbtiService.js`)

```javascript
// MBTI scoring service: 20 forced-choice questions → 4 dimension scores → 4-letter type

// The 20 questions. Each question has two options — A always moves in the
// positive direction of the dimension, B always in the negative direction.
// Dimensions: E(+)/I(-), N(+)/S(-), F(+)/T(-), P(+)/J(-)
export const MBTI_QUESTIONS = [
  // E/I Dimension (Questions 1–5)
  {
    id: 1, dimension: 'EI',
    question: "At the end of a long study day, you feel more recharged by:",
    optionA: { label: "Discussing what you learned with someone", direction: 'E' },
    optionB: { label: "Quietly reflecting on it alone", direction: 'I' },
  },
  {
    id: 2, dimension: 'EI',
    question: "When starting a new topic, you prefer to:",
    optionA: { label: "Jump in and discuss it with others to understand it", direction: 'E' },
    optionB: { label: "Read and think through it deeply before discussing", direction: 'I' },
  },
  {
    id: 3, dimension: 'EI',
    question: "During a group study session, you typically:",
    optionA: { label: "Drive the conversation and think out loud", direction: 'E' },
    optionB: { label: "Listen carefully and contribute when you've processed", direction: 'I' },
  },
  {
    id: 4, dimension: 'EI',
    question: "You learn faster when:",
    optionA: { label: "You can talk through the concept with someone", direction: 'E' },
    optionB: { label: "You have uninterrupted time to work through it yourself", direction: 'I' },
  },
  {
    id: 5, dimension: 'EI',
    question: "After a quiz you did poorly on, you'd rather:",
    optionA: { label: "Talk it through with a peer immediately", direction: 'E' },
    optionB: { label: "Review it alone and figure out what went wrong", direction: 'I' },
  },
  // S/N Dimension (Questions 6–10)
  {
    id: 6, dimension: 'SN',
    question: "When learning a new concept, you want to start with:",
    optionA: { label: "The big picture — how it fits into the broader field", direction: 'N' },
    optionB: { label: "The specific facts and step-by-step details", direction: 'S' },
  },
  {
    id: 7, dimension: 'SN',
    question: "You trust knowledge more when it comes from:",
    optionA: { label: "Theory, patterns, and logical frameworks", direction: 'N' },
    optionB: { label: "Proven examples, data, and real-world applications", direction: 'S' },
  },
  {
    id: 8, dimension: 'SN',
    question: "A great explanation for you is one that:",
    optionA: { label: "Shows you WHY something works — the underlying principle", direction: 'N' },
    optionB: { label: "Shows you HOW it works — the exact mechanics", direction: 'S' },
  },
  {
    id: 9, dimension: 'SN',
    question: "You are more likely to remember something if:",
    optionA: { label: "You understand the conceptual model behind it", direction: 'N' },
    optionB: { label: "You practiced it through concrete repetition", direction: 'S' },
  },
  {
    id: 10, dimension: 'SN',
    question: "Your notes tend to look more like:",
    optionA: { label: "Mind maps, connections, and speculative ideas", direction: 'N' },
    optionB: { label: "Organized lists, bullet points, and verbatim facts", direction: 'S' },
  },
  // T/F Dimension (Questions 11–15)
  {
    id: 11, dimension: 'TF',
    question: "When a tutor corrects you, the most useful feedback is:",
    optionA: { label: "An honest analysis of exactly where your logic broke down", direction: 'T' },
    optionB: { label: "Encouragement alongside specific guidance on what to improve", direction: 'F' },
  },
  {
    id: 12, dimension: 'TF',
    question: "You choose to study a topic because:",
    optionA: { label: "It makes logical sense and leads to clear outcomes", direction: 'T' },
    optionB: { label: "You are personally drawn to it or it matters to you deeply", direction: 'F' },
  },
  {
    id: 13, dimension: 'TF',
    question: "When you get a low quiz score, you feel motivated by:",
    optionA: { label: "A precise breakdown of the error — no sugarcoating", direction: 'T' },
    optionB: { label: "Reassurance that the gap is fixable, with a clear path forward", direction: 'F' },
  },
  {
    id: 14, dimension: 'TF',
    question: "In collaborative learning, you contribute most by:",
    optionA: { label: "Critiquing ideas rigorously to make them stronger", direction: 'T' },
    optionB: { label: "Supporting teammates and keeping the energy positive", direction: 'F' },
  },
  {
    id: 15, dimension: 'TF',
    question: "An ideal course curriculum would be:",
    optionA: { label: "Logically structured with clear cause-and-effect between topics", direction: 'T' },
    optionB: { label: "Connected to real human stories and meaningful real-world impact", direction: 'F' },
  },
  // J/P Dimension (Questions 16–20)
  {
    id: 16, dimension: 'JP',
    question: "Your ideal study plan is:",
    optionA: { label: "Flexible — I explore what interests me and adapt as I go", direction: 'P' },
    optionB: { label: "Structured — I want a clear schedule with defined milestones", direction: 'J' },
  },
  {
    id: 17, dimension: 'JP',
    question: "When a new interesting tangent appears while studying, you:",
    optionA: { label: "Follow it — exploration is part of learning", direction: 'P' },
    optionB: { label: "Note it for later and stay on the planned topic", direction: 'J' },
  },
  {
    id: 18, dimension: 'JP',
    question: "You feel more accomplished after a study session when:",
    optionA: { label: "You deeply explored an interesting thread, even if unplanned", direction: 'P' },
    optionB: { label: "You completed everything you set out to do", direction: 'J' },
  },
  {
    id: 19, dimension: 'JP',
    question: "Deadlines make you feel:",
    optionA: { label: "Constrained — I work better with open-ended timelines", direction: 'P' },
    optionB: { label: "Focused — they help me organize my energy efficiently", direction: 'J' },
  },
  {
    id: 20, dimension: 'JP',
    question: "A good learning app should:",
    optionA: { label: "Let me wander through topics freely and discover connections", direction: 'P' },
    optionB: { label: "Give me a clear roadmap with checkpoints and progress tracking", direction: 'J' },
  },
];

// Scoring function: takes array of { questionId, answer: 'A' | 'B' }
// Returns { mbtiType, ei_score, sn_score, tf_score, jp_score }
export function scoreMBTI(answers) {
  let EI = 0; // Positive = E, Negative = I
  let SN = 0; // Positive = N, Negative = S
  let TF = 0; // Positive = F, Negative = T
  let JP = 0; // Positive = P, Negative = J

  answers.forEach(({ questionId, answer }) => {
    const question = MBTI_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    const chosen = answer === 'A' ? question.optionA : question.optionB;
    const dir = chosen.direction;

    if (question.dimension === 'EI') EI += dir === 'E' ? 1 : -1;
    if (question.dimension === 'SN') SN += dir === 'N' ? 1 : -1;
    if (question.dimension === 'TF') TF += dir === 'F' ? 1 : -1;
    if (question.dimension === 'JP') JP += dir === 'P' ? 1 : -1;
  });

  const type =
    (EI >= 0 ? 'E' : 'I') +
    (SN >= 0 ? 'N' : 'S') +
    (TF >= 0 ? 'F' : 'T') +
    (JP >= 0 ? 'P' : 'J');

  return { mbtiType: type, ei_score: EI, sn_score: SN, tf_score: TF, jp_score: JP };
}
```

### 6.3 MBTI → AI Instruction Map (`client/src/lib/mbtiProfiles.js`)

This is the intelligence core of the personalization system. Every one of the 16 types has a distinct prompt instruction set.

```javascript
// Full 16-type MBTI to AI prompt instruction map
// Each type gets: cognitiveStyle, explanationApproach, feedbackTone, quizFraming, motivationFrame

export const MBTI_AI_PROFILES = {
  INTJ: {
    name: "The Architect",
    cognitiveStyle: "Systems thinker. Values efficiency, strategic depth, and logical coherence.",
    explanationApproach: "Lead with the theoretical framework, then show how details fit into it. Use precise, technical vocabulary without simplifying. Avoid hedging language.",
    feedbackTone: "Direct and analytical. State what was incorrect, why it was incorrect, and the correct reasoning chain. No encouragement is needed — clarity is the reward.",
    quizFraming: "Frame questions as system design or 'what would break if X changed?' challenges. Test edge cases and second-order effects.",
    motivationFrame: "Frame the value of the skill in terms of long-term strategic leverage and mastery. Don't sell motivation — assume it."
  },
  INTP: {
    name: "The Logician",
    cognitiveStyle: "Analytical, theoretical, loves finding inconsistencies and exploring 'what if' scenarios.",
    explanationApproach: "Present the foundational principle first. Then show the logical derivation of every sub-concept from that principle. Invite questioning — acknowledge open problems in the field.",
    feedbackTone: "Neutral and technical. Flag the specific logical flaw without emotional framing. Present the correct reasoning and invite the learner to verify it themselves.",
    quizFraming: "Ask questions that require the learner to prove or disprove a claim. Include at least one question with a subtle logical trap.",
    motivationFrame: "Frame the skill as an intellectually interesting puzzle, not a career necessity."
  },
  ENTJ: {
    name: "The Commander",
    cognitiveStyle: "Goal-driven, decisive, values efficiency and results. Sees learning as leverage.",
    explanationApproach: "Lead with outcomes and applications. Explain the shortest, highest-leverage path to mastery. Be assertive and structured. Use executive summaries before detail.",
    feedbackTone: "Blunt and action-oriented. State the gap, state the fix, move on. No emotional softening.",
    quizFraming: "Frame questions as decision-making scenarios: 'Given X situation, what is the optimal strategy?' Test for application, not definition.",
    motivationFrame: "Connect the skill directly to leadership, competitive advantage, or measurable outcomes."
  },
  ENTP: {
    name: "The Debater",
    cognitiveStyle: "Creative, contrarian, loves challenging assumptions and exploring multiple perspectives.",
    explanationApproach: "Present the concept, then immediately challenge it. Show where the conventional wisdom breaks down. Explore edge cases and alternative interpretations. Keep it intellectually energetic.",
    feedbackTone: "Challenging and engaging. Instead of just stating what was wrong, pose a question that leads the learner to find the error themselves.",
    quizFraming: "Ask open-ended questions that have multiple defensible answers. Include one question that challenges a widely-held belief in the field.",
    motivationFrame: "Frame the skill as a tool for argumentation, innovation, or disrupting the status quo."
  },
  INFJ: {
    name: "The Advocate",
    cognitiveStyle: "Seeks deep meaning and connection. Learns best when the 'why it matters' is clear.",
    explanationApproach: "Ground every concept in human impact or broader meaning before presenting mechanics. Use metaphor and narrative. Connect isolated facts to a larger coherent vision.",
    feedbackTone: "Warm but honest. Acknowledge what was understood well before addressing gaps. Frame the gap as a specific missing connection, not a failure.",
    quizFraming: "Frame questions around real-world human impact scenarios. 'How would this apply to a real person trying to solve a real problem?'",
    motivationFrame: "Frame the skill in terms of contribution, purpose, and the positive change it enables."
  },
  INFP: {
    name: "The Mediator",
    cognitiveStyle: "Values-driven, imaginative, intrinsically motivated. Disengages when content feels meaningless.",
    explanationApproach: "Make the content personal and story-driven. Use open-ended language. Encourage personal interpretation. Avoid rigid right/wrong framing where possible.",
    feedbackTone: "Gentle, validating, and specific. Begin with what the learner got right. Frame the gap as 'there's one more layer to explore here' rather than 'this is wrong.'",
    quizFraming: "Ask reflective questions: 'What does this concept mean to you?' and 'How would you explain this in your own words?'",
    motivationFrame: "Connect the skill to personal growth, creative expression, or a deeply held value."
  },
  ENFJ: {
    name: "The Protagonist",
    cognitiveStyle: "Empathetic, socially aware, inspired by collective progress and leadership.",
    explanationApproach: "Frame concepts through the lens of people and relationships. Use examples involving teams, communities, or social systems. Build concepts collaboratively in tone.",
    feedbackTone: "Encouraging and specific. Celebrate growth explicitly. Frame the remediation path as an exciting next step, not a correction.",
    quizFraming: "Frame questions around team dynamics or leadership scenarios. 'How would you explain this to your team?' or 'What would a great leader do here?'",
    motivationFrame: "Frame the skill in terms of inspiring others, building better teams, or having a positive social impact."
  },
  ENFP: {
    name: "The Campaigner",
    cognitiveStyle: "Enthusiastic, creative, makes unexpected connections. Bored by linear, repetitive content.",
    explanationApproach: "Keep it energetic and varied. Mix storytelling with concept explanation. Introduce surprising connections between this topic and unrelated fields. Avoid dry, mechanical explanations.",
    feedbackTone: "Upbeat and forward-looking. Celebrate the attempt, quickly pivot to what's exciting about the corrected understanding.",
    quizFraming: "Ask creative, scenario-based questions. Reward unexpected but logically sound answers. Include at least one imaginative 'what if' question.",
    motivationFrame: "Frame the skill as opening up new possibilities, adventures, or creative directions."
  },
  ISTJ: {
    name: "The Logistician",
    cognitiveStyle: "Detail-oriented, systematic, trusts established methods and proven facts.",
    explanationApproach: "Present information in strict sequential order. Use numbered steps, clear definitions, and established terminology. Cite well-known authorities or standards where relevant. No speculation.",
    feedbackTone: "Precise and factual. State exactly what was incorrect, reference the correct definition or procedure, and confirm the standard to follow.",
    quizFraming: "Test procedural knowledge: 'What is the correct sequence of steps?' and 'According to established practice, what should be done when X occurs?'",
    motivationFrame: "Frame the skill in terms of reliability, correctness, and building a dependable foundation."
  },
  ISFJ: {
    name: "The Defender",
    cognitiveStyle: "Supportive, patient, detail-oriented. Learns through care, repetition, and clear examples.",
    explanationApproach: "Use concrete, relatable real-world examples. Build understanding gradually — never skip foundational steps. Use a warm, patient tone. Acknowledge when a concept is genuinely difficult.",
    feedbackTone: "Warm and supportive. Emphasize what was understood correctly. Frame corrections as minor adjustments, not failures. Be patient.",
    quizFraming: "Use familiar, relatable scenarios. Give enough context in each question that the learner doesn't feel ambushed. Avoid abstract or trick questions.",
    motivationFrame: "Frame the skill in terms of helping others, reliability, and building a solid dependable knowledge base."
  },
  ESTJ: {
    name: "The Executive",
    cognitiveStyle: "Results-oriented, rule-following, values clear structure and measurable outcomes.",
    explanationApproach: "Lead with the correct answer or best practice, then explain why it is correct. Use checklists, rules, and established frameworks. Be direct and efficient.",
    feedbackTone: "Clear and action-oriented. State the problem, the standard, and the corrected approach. Move quickly.",
    quizFraming: "Test rule application: 'What is the correct procedure here?' and 'Which of these approaches follows best practice?' Frame as professional decision scenarios.",
    motivationFrame: "Frame the skill in terms of professional competence, organizational efficiency, and measurable results."
  },
  ESFJ: {
    name: "The Consul",
    cognitiveStyle: "Socially aware, values harmony and cooperation. Motivated by helping others.",
    explanationApproach: "Use warm, social examples. Frame concepts through the impact they have on people and relationships. Acknowledge the learner's effort explicitly before introducing complexity.",
    feedbackTone: "Encouraging and empathetic. Lead with acknowledgment, follow with specific guidance. Never use critical language — use 'one thing to revisit' framing.",
    quizFraming: "Frame questions as interpersonal or community scenarios. 'How would you explain this to a colleague?' or 'What impact would this have on the team?'",
    motivationFrame: "Frame the skill in terms of being more helpful, supportive, and valued by others."
  },
  ISTP: {
    name: "The Virtuoso",
    cognitiveStyle: "Hands-on, observational, learns best by doing and by understanding how things actually work.",
    explanationApproach: "Lead with the mechanism — how does this actually work, physically or operationally? Use worked examples before definitions. Skip abstract theory unless it explains something concrete.",
    feedbackTone: "Minimal and direct. State what broke and why, mechanistically. No motivational language — trust that the learner just wants the accurate information.",
    quizFraming: "Frame questions as troubleshooting scenarios: 'Given this behavior, what is the underlying cause?' Test mechanical understanding, not definitions.",
    motivationFrame: "Frame the skill as a new tool or technique that gives the learner greater capability and autonomy."
  },
  ISFP: {
    name: "The Adventurer",
    cognitiveStyle: "Sensory, present-focused, aesthetic. Learns through exploration and personal relevance.",
    explanationApproach: "Keep explanations concrete, personal, and experiential. Avoid abstract jargon. Use vivid real-world examples. Allow space for the learner's own interpretation.",
    feedbackTone: "Gentle and respectful. Acknowledge the learner's perspective before offering the correction. Use 'another way to see this' framing.",
    quizFraming: "Frame questions as personal experience scenarios: 'Imagine you encounter X in real life — what would you do?' Avoid cold, academic question formats.",
    motivationFrame: "Frame the skill in terms of enriching personal experience, creative expression, and freedom."
  },
  ESTP: {
    name: "The Entrepreneur",
    cognitiveStyle: "Action-oriented, competitive, learns by doing and by seeing immediate results.",
    explanationApproach: "Get to the point immediately. Lead with the actionable application, then the underlying concept if needed. Use high-energy language. Include risk/reward framing.",
    feedbackTone: "Fast and direct. State the gap in one sentence, state the fix, move on. Frame it as a competitive advantage — 'knowing this puts you ahead.'",
    quizFraming: "Frame questions as fast-paced real-world scenarios: 'You have 30 seconds to decide — what do you do?' Test judgment and rapid application.",
    motivationFrame: "Frame the skill in terms of winning, competitive edge, speed, and visible immediate results."
  },
  ESFP: {
    name: "The Entertainer",
    cognitiveStyle: "Experiential, enthusiastic, socially engaged. Learns best through fun, variety, and social connection.",
    explanationApproach: "Keep it dynamic and varied. Use stories, humor, and relatable scenarios. Connect concepts to pop culture or everyday life. Avoid dry academic language.",
    feedbackTone: "Upbeat and affirming. Celebrate what went well with genuine enthusiasm. Make the correction feel like an exciting discovery, not a setback.",
    quizFraming: "Frame questions as engaging social or real-life scenarios. Include an element of fun or surprise. Reward creative, well-reasoned answers.",
    motivationFrame: "Frame the skill in terms of the fun, social recognition, and exciting experiences it enables."
  },
};
```

### 6.4 MBTI Test UI Component (`client/src/components/auth/MBTITest.jsx`)

```jsx
// Full 20-question MBTI forced-choice test with progress bar and animated transitions
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MBTI_QUESTIONS } from '../../lib/mbtiQuestions'; // Export questions from a shared lib
import axios from 'axios';

export default function MBTITest({ session, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const question = MBTI_QUESTIONS[currentQ];
  const progress = (currentQ / MBTI_QUESTIONS.length) * 100;

  const handleAnswer = async (choice) => {
    const newAnswers = [...answers, { questionId: question.id, answer: choice }];
    setAnswers(newAnswers);

    if (currentQ < MBTI_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 200);
    } else {
      // All questions answered — score and save
      setSaving(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/mbti`,
        { answers: newAnswers },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setResult(data.profile);
      setSaving(false);
    }
  };

  // Results screen
  if (result) {
    const { mbtiType } = result;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gray-950 flex items-center justify-center p-8"
      >
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-6">🧠</div>
          <h2 className="text-4xl font-bold text-indigo-400 mb-2">{mbtiType}</h2>
          <p className="text-gray-300 text-lg mb-2">
            You are: <span className="text-white font-semibold">{result.typeName}</span>
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">{result.cognitiveStyle}</p>
          <p className="text-indigo-300 text-sm mb-8">
            Pulse-Learn AI will now adapt every lesson, quiz, and piece of feedback to match how your mind works.
          </p>
          <button
            onClick={() => onComplete(result)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-lg transition-all"
          >
            Build My Personalized Learning Engine →
          </button>
        </div>
      </motion.div>
    );
  }

  // Test question screen
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        {/* Progress bar */}
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>Question {currentQ + 1} of {MBTI_QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full mb-10 overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-xs text-indigo-400 font-mono uppercase tracking-wider mb-4">
              {question.dimension === 'EI' && 'Energy Direction'}
              {question.dimension === 'SN' && 'Information Processing'}
              {question.dimension === 'TF' && 'Decision Making'}
              {question.dimension === 'JP' && 'Structure Preference'}
            </p>
            <h2 className="text-xl font-bold text-white mb-10 leading-relaxed">
              {question.question}
            </h2>

            <div className="space-y-4">
              {['A', 'B'].map((choice) => {
                const opt = choice === 'A' ? question.optionA : question.optionB;
                return (
                  <motion.button
                    key={choice}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(choice)}
                    className="w-full text-left px-6 py-5 rounded-2xl border border-gray-700 bg-gray-900 
                      hover:border-indigo-500 hover:bg-indigo-950 transition-all duration-200 text-white text-base"
                  >
                    <span className="text-indigo-400 font-mono mr-3">{choice}.</span>
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {saving && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-indigo-400 mt-10 animate-pulse text-sm"
          >
            Analyzing your cognitive profile...
          </motion.p>
        )}
      </div>
    </div>
  );
}
```

### 6.5 MBTI Route (`server/routes/user.js` — updated)

```javascript
// POST /api/user/mbti — scores the test, saves result, returns profile with type name
import { scoreMBTI, MBTI_QUESTIONS } from '../services/mbtiService.js';
import { MBTI_AI_PROFILES } from '../lib/mbtiProfiles.js'; // Same map, server copy

router.post('/mbti', requireAuth, async (req, res) => {
  try {
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
```

### 6.6 Updated `buildPersonalityContext` Using MBTI

Replace the v2 `buildPersonalityContext` function entirely:

```javascript
// In server/services/geminiService.js — MBTI-powered context builder
import { MBTI_AI_PROFILES } from '../lib/mbtiProfiles.js';

export function buildPersonalityContext(userProfile) {
  if (!userProfile?.mbti_type) return ''; // Graceful fallback

  const type = userProfile.mbti_type;
  const profile = MBTI_AI_PROFILES[type];

  if (!profile) return '';

  return `
=== LEARNER COGNITIVE PROFILE (MBTI: ${type} — ${profile.name}) ===
Cognitive Style: ${profile.cognitiveStyle}

How to explain concepts: ${profile.explanationApproach}
How to frame quiz questions: ${profile.quizFraming}
How to deliver feedback: ${profile.feedbackTone}
How to frame motivation: ${profile.motivationFrame}

Additional calibration from self-reported preferences:
- Study domain: ${userProfile.study_domain || 'general'}
- Preferred session length: ${userProfile.preferred_session_minutes || 30} minutes
- Bias node time estimates toward ${userProfile.preferred_session_minutes || 30}-minute chunks
================================================================
`;
}
```

---

## 7. Feature B: Unified Block Workspace (The Loop/Notion Model)

### 7.1 Concept: What "Unified Block Workspace" Means

In v2, the app had separate pages: a Skill Tree page, an Analytics page, a Quiz panel. The user had to navigate between them.

In v3, **everything lives on one canvas**. The workspace is an infinite grid of composable blocks. Each block is an independent, resizable widget. The user assembles their own learning environment — like building with LEGO, not navigating a website.

```
┌────────────────────────────────────────────────────────────────┐
│  WORKSPACE: "Docker Mastery — Team Roadmap"          [+ Block] │
│                                                                │
│  ┌──────────────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  📊 Skill Tree        │  │ 📈 Score     │  │ 📋 Node     │ │
│  │  [Node cards with    │  │ Trend Chart  │  │ Table       │ │
│  │   SVG connections]   │  │ [Line Chart] │  │ [Sortable]  │ │
│  │                      │  │              │  │             │ │
│  │  ● Node 1 ✅         │  │              │  │ Node 1 ✅   │ │
│  │  ● Node 2 🔒         │  └──────────────┘  │ Node 2 🔒   │ │
│  │  ● Node 3 ⚡(active) │  ┌──────────────┐  │ Node 3 ⚡   │ │
│  │                      │  │ 🧪 Quiz       │  └─────────────┘ │
│  └──────────────────────┘  │ [Active for  │                  │
│  ┌──────────────────────┐  │  Node 3]     │  ┌─────────────┐ │
│  │  📝 Team Notes        │  │              │  │ 🧬 MBTI     │ │
│  │  [Tiptap rich text]  │  └──────────────┘  │ Insight     │ │
│  │  Collaborative edit  │                    │ Block       │ │
│  └──────────────────────┘                    └─────────────┘ │
│                                                                │
│  Type / to add a block...                                      │
└────────────────────────────────────────────────────────────────┘
```

### 7.2 Block Type Registry (`client/src/lib/blockTypes.js`)

```javascript
// Block type registry: defines every block type the workspace can render
import {
  GitBranch, BarChart2, Table, Brain,
  FileText, TrendingUp, Atom
} from 'lucide-react';

export const BLOCK_TYPES = {
  SKILL_TREE: {
    id: 'SKILL_TREE',
    label: 'Skill Tree',
    description: 'Interactive visual learning path',
    icon: GitBranch,
    defaultSize: { w: 6, h: 8 },   // Units in react-grid-layout's 12-column grid
    minSize: { w: 4, h: 6 },
  },
  CHART: {
    id: 'CHART',
    label: 'Analytics Chart',
    description: 'Ask for any chart in plain English',
    icon: BarChart2,
    defaultSize: { w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
  },
  TABLE: {
    id: 'TABLE',
    label: 'Node Table',
    description: 'Spreadsheet view of all nodes and scores',
    icon: Table,
    defaultSize: { w: 5, h: 6 },
    minSize: { w: 4, h: 4 },
  },
  QUIZ: {
    id: 'QUIZ',
    label: 'Quiz Panel',
    description: 'Take the active recall quiz inline',
    icon: Brain,
    defaultSize: { w: 4, h: 7 },
    minSize: { w: 3, h: 5 },
  },
  NOTES: {
    id: 'NOTES',
    label: 'Team Notes',
    description: 'Collaborative rich text editor',
    icon: FileText,
    defaultSize: { w: 4, h: 5 },
    minSize: { w: 3, h: 3 },
  },
  PROGRESS: {
    id: 'PROGRESS',
    label: 'Progress Overview',
    description: 'Completion stats and time estimates',
    icon: TrendingUp,
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
  },
  MBTI_INSIGHT: {
    id: 'MBTI_INSIGHT',
    label: 'Cognitive Profile',
    description: 'Your MBTI type and how the AI adapts to you',
    icon: Atom,
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
  },
};
```

### 7.3 Workspace Canvas (`client/src/components/workspace/WorkspaceCanvas.jsx`)

```jsx
// Unified drag-and-drop resizable block canvas using react-grid-layout
// GitHub Copilot trigger: // React drag-and-drop resizable grid canvas with slash-command block insertion
import { useState, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Plus } from 'lucide-react';
import { BLOCK_TYPES } from '../../lib/blockTypes';
import BlockPalette from './BlockPalette';
import SkillTreeBlock from './blocks/SkillTreeBlock';
import ChartBlock from './blocks/ChartBlock';
import TableBlock from './blocks/TableBlock';
import QuizBlock from './blocks/QuizBlock';
import NotesBlock from './blocks/NotesBlock';
import ProgressBlock from './blocks/ProgressBlock';
import MBTIInsightBlock from './blocks/MBTIInsightBlock';
import { useWorkspace } from '../../hooks/useWorkspace';

const ResponsiveGrid = WidthProvider(Responsive);

// Map block type ID to the actual React component
const BLOCK_COMPONENTS = {
  SKILL_TREE: SkillTreeBlock,
  CHART: ChartBlock,
  TABLE: TableBlock,
  QUIZ: QuizBlock,
  NOTES: NotesBlock,
  PROGRESS: ProgressBlock,
  MBTI_INSIGHT: MBTIInsightBlock,
};

export default function WorkspaceCanvas({ roadmap, nodes, session, profile, onNodeUpdate }) {
  const { layout, saveLayout, addBlock, removeBlock } = useWorkspace(
    roadmap.id,
    session.access_token
  );
  const [showPalette, setShowPalette] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const handleLayoutChange = useCallback((newLayout) => {
    // Merge position/size changes back into our layout state
    const updatedLayout = layout.map((block) => {
      const gridItem = newLayout.find((i) => i.i === block.id);
      if (gridItem) {
        return { ...block, x: gridItem.x, y: gridItem.y, w: gridItem.w, h: gridItem.h };
      }
      return block;
    });
    saveLayout(updatedLayout);
  }, [layout, saveLayout]);

  const handleAddBlock = (blockType) => {
    const type = BLOCK_TYPES[blockType];
    const newBlock = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      x: 0,
      y: Infinity, // react-grid-layout appends to bottom
      w: type.defaultSize.w,
      h: type.defaultSize.h,
      minW: type.minSize.w,
      minH: type.minSize.h,
      config: {}, // Block-specific config (e.g. which chart, which node)
    };
    addBlock(newBlock);
    setShowPalette(false);
  };

  // Convert layout array to react-grid-layout format
  const gridLayout = layout.map((b) => ({
    i: b.id, x: b.x, y: b.y, w: b.w, h: b.h,
    minW: b.minW, minH: b.minH,
  }));

  return (
    <div className="relative min-h-screen bg-gray-950">
      {/* Workspace header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div>
          <h1 className="text-white font-bold text-xl">{roadmap.title}</h1>
          <p className="text-gray-500 text-xs">{nodes.length} nodes · {roadmap.time_budget_hours}h budget</p>
        </div>
        <button
          onClick={() => setShowPalette(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 
            text-white text-sm font-medium rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Add Block
        </button>
      </div>

      {/* Block palette modal */}
      {showPalette && (
        <BlockPalette
          onSelect={handleAddBlock}
          onClose={() => setShowPalette(false)}
        />
      )}

      {/* Block grid */}
      <div className="p-4">
        <ResponsiveGrid
          className="layout"
          layouts={{ lg: gridLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          rowHeight={60}
          isDraggable
          isResizable
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
        >
          {layout.map((block) => {
            const BlockComponent = BLOCK_COMPONENTS[block.type];
            if (!BlockComponent) return null;

            return (
              <div
                key={block.id}
                className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden 
                  flex flex-col shadow-xl"
              >
                {/* Block header — drag handle */}
                <div className="drag-handle flex items-center justify-between px-4 py-2 
                  bg-gray-800 border-b border-gray-700 cursor-move">
                  <span className="text-xs text-gray-400 font-medium">
                    {BLOCK_TYPES[block.type]?.label}
                  </span>
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Block content */}
                <div className="flex-1 overflow-auto">
                  <BlockComponent
                    roadmap={roadmap}
                    nodes={nodes}
                    session={session}
                    profile={profile}
                    selectedNode={selectedNode}
                    onNodeSelect={setSelectedNode}
                    onNodeUpdate={onNodeUpdate}
                    config={block.config}
                  />
                </div>
              </div>
            );
          })}
        </ResponsiveGrid>

        {layout.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-600">
            <Plus className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg mb-2">Your workspace is empty</p>
            <p className="text-sm mb-6">Click "Add Block" to build your learning environment</p>
            <button
              onClick={() => setShowPalette(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm"
            >
              Add your first block
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 7.4 Block Palette (`client/src/components/workspace/BlockPalette.jsx`)

```jsx
// Block selector modal — shows all available block types with icon, name, description
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { BLOCK_TYPES } from '../../lib/blockTypes';

export default function BlockPalette({ onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-xl shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Add Block</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        <p className="text-gray-500 text-xs mb-4">
          Choose a block to add to your workspace canvas
        </p>

        <div className="grid grid-cols-2 gap-3">
          {Object.values(BLOCK_TYPES).map((blockType) => {
            const Icon = blockType.icon;
            return (
              <button
                key={blockType.id}
                onClick={() => onSelect(blockType.id)}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-700 bg-gray-800 
                  hover:border-indigo-500 hover:bg-indigo-950 transition-all text-left"
              >
                <Icon className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{blockType.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{blockType.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
```

### 7.5 Table Block (`client/src/components/workspace/blocks/TableBlock.jsx`)

The Table block gives a spreadsheet-style view of all nodes — sortable by status, time, score.

```jsx
// Sortable, filterable table view of all roadmap nodes with status, score, assigned user
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const STATUS_COLORS = {
  locked: 'text-gray-500',
  unlocked: 'text-indigo-400',
  in_progress: 'text-yellow-400',
  completed: 'text-green-400',
};

export default function TableBlock({ nodes, onNodeSelect }) {
  const [sortBy, setSortBy] = useState('sequence_order');
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState('all');

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const sorted = [...nodes]
    .filter(n => filter === 'all' || n.status === filter)
    .sort((a, b) => {
      const valA = a[sortBy]; const valB = b[sortBy];
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }) => (
    sortBy === col
      ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
      : <ChevronUp className="w-3 h-3 opacity-20" />
  );

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-3">
        {['all', 'unlocked', 'completed', 'locked'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1 rounded-full transition-all ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 text-xs border-b border-gray-700">
              {[
                { key: 'sequence_order', label: '#' },
                { key: 'title', label: 'Topic' },
                { key: 'estimated_minutes', label: 'Time' },
                { key: 'status', label: 'Status' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="py-2 pr-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {col.label} <SortIcon col={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((node) => (
              <tr
                key={node.id}
                onClick={() => onNodeSelect(node)}
                className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <td className="py-2 pr-4 text-gray-500 font-mono text-xs">
                  {node.sequence_order >= 9999 ? '↳' : node.sequence_order}
                </td>
                <td className="py-2 pr-4 text-white max-w-xs truncate">{node.title}</td>
                <td className="py-2 pr-4 text-gray-400">{node.estimated_minutes}m</td>
                <td className={`py-2 pr-4 ${STATUS_COLORS[node.status] || 'text-gray-400'} capitalize`}>
                  {node.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 7.6 Progress Block (`client/src/components/workspace/blocks/ProgressBlock.jsx`)

```jsx
// Progress overview block: completion ring, time stats, score average
export default function ProgressBlock({ nodes }) {
  const total = nodes.filter(n => n.sequence_order < 9999).length;
  const completed = nodes.filter(n => n.status === 'completed' && n.sequence_order < 9999).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const totalMinutes = nodes.reduce((sum, n) => sum + n.estimated_minutes, 0);
  const doneMinutes = nodes
    .filter(n => n.status === 'completed')
    .reduce((sum, n) => sum + n.estimated_minutes, 0);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div className="p-5 flex flex-col items-center justify-center h-full gap-4">
      {/* SVG progress ring */}
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke="#6366f1" strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="16" fontWeight="bold">
          {pct}%
        </text>
      </svg>

      <div className="text-center">
        <p className="text-white font-semibold">{completed} / {total} nodes complete</p>
        <p className="text-gray-400 text-xs mt-1">
          {Math.round(doneMinutes / 60)}h done · {Math.round((totalMinutes - doneMinutes) / 60)}h remaining
        </p>
      </div>
    </div>
  );
}
```

### 7.7 MBTI Insight Block (`client/src/components/workspace/blocks/MBTIInsightBlock.jsx`)

```jsx
// Shows the user's MBTI type with the 4 dimension sliders
import { MBTI_AI_PROFILES } from '../../../lib/mbtiProfiles';

export default function MBTIInsightBlock({ profile }) {
  if (!profile?.mbti_type) {
    return (
      <div className="p-5 text-gray-500 text-sm text-center">
        Complete the MBTI test to see your cognitive profile here.
      </div>
    );
  }

  const type = profile.mbti_type;
  const typeInfo = MBTI_AI_PROFILES[type];

  const dimensions = [
    { label: 'E', opposite: 'I', score: profile.ei_score, max: 5 },
    { label: 'N', opposite: 'S', score: profile.sn_score, max: 5 },
    { label: 'F', opposite: 'T', score: profile.tf_score, max: 5 },
    { label: 'P', opposite: 'J', score: profile.jp_score, max: 5 },
  ];

  return (
    <div className="p-5 h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-indigo-400">{type}</span>
        <div>
          <p className="text-white font-medium text-sm">{typeInfo?.name}</p>
          <p className="text-gray-500 text-xs">Your cognitive type</p>
        </div>
      </div>

      <div className="space-y-3">
        {dimensions.map(({ label, opposite, score, max }) => {
          const normalizedScore = score / max; // -1 to 1
          const pct = Math.round(((normalizedScore + 1) / 2) * 100); // 0–100
          return (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{score >= 0 ? label : opposite}</span>
                <span>{score >= 0 ? opposite : label}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${pct}%`, marginLeft: score < 0 ? `${pct}%` : 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-gray-400 text-xs leading-relaxed mt-auto">
        {typeInfo?.cognitiveStyle}
      </p>
    </div>
  );
}
```

### 7.8 Workspace Layout Hook (`client/src/hooks/useWorkspace.js`)

```javascript
// Workspace layout hook: loads layout from Supabase, saves on change, manages blocks
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useWorkspace(roadmapId, accessToken) {
  const [layout, setLayout] = useState([]);
  const [dirty, setDirty] = useState(false);

  // Load layout from server on mount
  useEffect(() => {
    if (!roadmapId) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/workspace/${roadmapId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data }) => {
        if (data.layout && data.layout.length > 0) {
          setLayout(data.layout);
        } else {
          // Default layout for new workspaces
          setLayout([
            { id: 'SKILL_TREE-default', type: 'SKILL_TREE', x: 0, y: 0, w: 6, h: 8, minW: 4, minH: 6, config: {} },
            { id: 'PROGRESS-default', type: 'PROGRESS', x: 6, y: 0, w: 3, h: 4, minW: 2, minH: 3, config: {} },
            { id: 'MBTI_INSIGHT-default', type: 'MBTI_INSIGHT', x: 9, y: 0, w: 3, h: 4, minW: 2, minH: 3, config: {} },
          ]);
        }
      });
  }, [roadmapId]);

  // Debounced save — saves 2 seconds after the last layout change
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      axios.post(
        `${import.meta.env.VITE_API_URL}/api/workspace/${roadmapId}`,
        { layout },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setDirty(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [layout, dirty]);

  const saveLayout = useCallback((newLayout) => {
    setLayout(newLayout);
    setDirty(true);
  }, []);

  const addBlock = useCallback((newBlock) => {
    setLayout(prev => [...prev, newBlock]);
    setDirty(true);
  }, []);

  const removeBlock = useCallback((blockId) => {
    setLayout(prev => prev.filter(b => b.id !== blockId));
    setDirty(true);
  }, []);

  return { layout, saveLayout, addBlock, removeBlock };
}
```

### 7.9 Workspace Route (`server/routes/workspace.js`)

```javascript
// GET /api/workspace/:roadmapId — load saved layout
// POST /api/workspace/:roadmapId — save layout
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.get('/:roadmapId', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workspace_layouts')
      .select('layout_json')
      .eq('roadmap_id', req.params.roadmapId)
      .eq('user_id', req.user.id)
      .single();

    res.json({ layout: data?.layout_json || [] });
  } catch (err) {
    res.json({ layout: [] }); // Return empty — not an error
  }
});

router.post('/:roadmapId', requireAuth, async (req, res) => {
  try {
    const { layout } = req.body;
    const { error } = await supabase
      .from('workspace_layouts')
      .upsert({
        roadmap_id: req.params.roadmapId,
        user_id: req.user.id,
        layout_json: layout,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

---

## 8. Feature C: AI Differentiation Layer — What Nobody Else Does

### 8.1 The Five Differentiators (Build These Into Your Demo Script)

When presenting or pitching, use this framing for each feature:

**Differentiator 1 — MBTI-Cognition Aware AI**

> "ChatGPT gives the same explanation to a 16-year-old beginner and a PhD researcher. Pulse-Learn knows you're an INTJ, so it skips the analogies, uses technical vocabulary, surfaces the logical framework first, and gives you direct feedback without softening. The AI thinks in your cognitive language."

*No competing EdTech product does MBTI-level prompt personalization.*

**Differentiator 2 — Live Curriculum Mutation**

> "Every other course platform has a static curriculum. If you fail Module 4, you just watch Module 4 again. Pulse-Learn's AI doesn't repeat — it surgically identifies the exact gap and inserts a targeted remediation node directly into your skill tree. The curriculum rewrites itself in real-time."

*Ollama can't do this. It has no curriculum. ChatGPT forgets you failed. Coursera shows you the same video.*

**Differentiator 3 — Bring Your Own Syllabus**

> "Every competing tool is locked to its own content library — Khan Academy's content, Coursera's courses, Duolingo's language database. Pulse-Learn works on ANY document. Upload your PhD thesis outline, your company's onboarding PDF, your professor's syllabus — and get a fully adaptive personalized skill tree in under 8 seconds."

*This is the zero-content-library moat.*

**Differentiator 4 — Verifiable Blockchain Credential**

> "A Coursera certificate lives in Coursera's database. If Coursera shuts down, your credential disappears. A Pulse-Learn credential is a transaction hash on Stellar's public blockchain — permanently, publicly verifiable by anyone, forever, with no trusted third party."

*Decentralized credential verification is completely absent from all consumer EdTech.*

**Differentiator 5 — Composable Block Workspace**

> "Notion has blocks but no adaptive quiz engine. Microsoft Loop has real-time collaboration but no AI learning path. Pulse-Learn is the only platform where your skill tree, your live quiz, your analytics charts, your team notes, and your cognitive profile all live in one composable canvas that your whole team can work on simultaneously."

*The block workspace model applied to educational AI is a product category that doesn't exist yet.*

### 8.2 The "vs Ollama" Answer (Verbatim)

When specifically asked "How is this different from Ollama?":

> "Ollama is infrastructure — it lets you run a language model on your laptop. It has no concept of a student, a curriculum, a quiz, a score, or a credential. It's like asking how a database engine is different from a business application. Ollama is the engine. Pulse-Learn is a complete product built on top of a hosted AI engine (Gemini) that adds educational workflow, cognitive personalization, adaptive path mutation, team collaboration, and blockchain verification — none of which Ollama provides or could provide without a full application built on top of it."

### 8.3 Feature Comparison Table (Use in README and Demo)

| Capability | Pulse-Learn | ChatGPT | Ollama | Notion AI | Coursera | Duolingo |
|---|---|---|---|---|---|---|
| Custom document → curriculum | ✅ | Partial | ❌ | ❌ | ❌ | ❌ |
| MBTI-aware AI personalization | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Real-time path mutation on failure | ✅ | ❌ | ❌ | ❌ | ❌ | Partial |
| Active recall quiz engine | ✅ | ❌ | ❌ | ❌ | Partial | ✅ |
| Blockchain-verified credential | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Team collaborative learning | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Composable block workspace | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Natural language analytics | ✅ | Partial | ❌ | Partial | ❌ | ❌ |
| Works on any domain | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Stateful multi-session progress | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Local/private model | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## 9. Updated AI Prompt Engineering Contracts

### All Gemini Functions — v3 Summary

| Function | Key Change from v2 |
|---|---|
| `buildPersonalityContext(profile)` | Now uses `mbti_type` to look up full 16-type profile. Returns 8-line instruction block |
| `generateRoadmapFromText(text, hours, profile)` | Unchanged signature. Internally uses new MBTI context |
| `generateQuizQuestions(title, summary, profile)` | MBTI `quizFraming` instruction now drives question style |
| `evaluateAnswers(title, summary, answers, profile)` | MBTI `feedbackTone` instruction drives evaluation language |
| `processAnalyticsQuery(query, userId, profile)` | MBTI `cognitiveStyle` optionally frames insight descriptions |

### Critical Rules — Do Not Break

```javascript
// RULE 1: responseMimeType must be set on every model instance
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { responseMimeType: 'application/json' },
});

// RULE 2: buildPersonalityContext ALWAYS goes first in every prompt
const prompt = `${buildPersonalityContext(userProfile)}\n\nYou are a...`;

// RULE 3: Always validate parsed structure before returning
const parsed = JSON.parse(result.response.text());
if (!parsed.nodes) throw new Error('Invalid AI response structure');

// RULE 4: Safety null for remediation when passed
if (parsed.passed) parsed.remediation_node = null;

// RULE 5: Validate MBTI type before using it in profile lookup
const VALID_TYPES = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
                     'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
if (!VALID_TYPES.includes(mbtiType)) throw new Error(`Invalid MBTI type: ${mbtiType}`);
```

---

## 10. Backend — All Routes v3

```javascript
// server/index.js — complete route registration
import userRouter from './routes/user.js';       // /api/user/profile, /api/user/mbti
import roadmapRouter from './routes/roadmap.js'; // /api/roadmap/generate, /:id, /:id/complete
import nodeRouter from './routes/node.js';       // /api/node/quiz, /api/node/verify
import analyticsRouter from './routes/analytics.js'; // /api/analytics/query
import collabRouter from './routes/collab.js';   // /api/collab/*
import workspaceRouter from './routes/workspace.js'; // /api/workspace/:roadmapId

app.use('/api/user', userRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/node', nodeRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/collab', collabRouter);
app.use('/api/workspace', workspaceRouter);
```

---

## 11. Frontend — All Components v3

### App.jsx Auth Gate (Updated with MBTI check)

```jsx
// Flow: session → profile check → MBTI check → workspace
// if profile.mbti_type is null → show MBTITest
// if profile exists with mbti_type → show WorkspaceCanvas

if (!session) return <LoginForm />;
if (profile === null || !profile?.mbti_type) {
  return <MBTITest session={session} onComplete={setProfile} />;
}
return <WorkspaceCanvas roadmap={roadmap} nodes={nodes} session={session} profile={profile} />;
```

---

## 12. Supabase Realtime & Workspace Sync

From v2, unchanged. Add one new table to realtime publication:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_layouts;
```

This allows collaborators to optionally see each other's layout updates (owner can "push" a layout template to the whole team).

---

## 13. Full API Contract Table v3

| Method | Route | Body / Params | Response |
|---|---|---|---|
| `POST` | `/api/user/mbti` | `{ answers: [{ questionId, answer }] × 20 }` | `{ profile: { mbti_type, typeName, cognitiveStyle, scores } }` |
| `GET` | `/api/user/profile` | — | `{ profile }` or `{ profile: null }` |
| `POST` | `/api/user/profile` | `{ study_domain, preferred_session_minutes }` | `{ profile }` |
| `POST` | `/api/roadmap/generate` | `file, time_budget_hours, target_date` | `{ roadmap: { ...roadmap, nodes[] } }` |
| `GET` | `/api/roadmap/:id` | — | `{ roadmap: { ...roadmap, nodes[] } }` |
| `POST` | `/api/roadmap/:id/complete` | `{ final_score }` | `{ stellar_tx_hash }` |
| `POST` | `/api/node/quiz` | `{ node_id }` | `{ questions: [{ q_id, question }] × 3 }` |
| `POST` | `/api/node/verify` | `{ node_id, roadmap_id, user_answers[], node_title, node_summary, sequence_order }` | `{ passed, score, feedback, mutation_triggered, new_remediation_node }` |
| `POST` | `/api/analytics/query` | `{ query: "string" }` | `{ chart: { chartType, title, description, data[], ... } }` |
| `POST` | `/api/collab/invite` | `{ roadmap_id, invitee_email, role }` | `{ collaborator }` |
| `GET` | `/api/collab/:roadmap_id` | — | `{ collaborators[] }` |
| `PATCH` | `/api/collab/node/assign` | `{ node_id, assigned_to }` | `{ success: true }` |
| `POST` | `/api/collab/comment` | `{ node_id, content }` | `{ comment }` |
| `GET` | `/api/workspace/:roadmapId` | — | `{ layout: [...blocks] }` |
| `POST` | `/api/workspace/:roadmapId` | `{ layout: [...blocks] }` | `{ success: true }` |

---

## 14. Edge Cases & Mitigations v3

### Edge Case 1 — MBTI Score Ties (e.g. EI score = 0)

- **Problem:** If a user's E/I score is exactly 0 (5 E choices, 5 I choices), the `>=0` rule picks E. This is fine — in standard MBTI practice, equal scores default to one pole. Document this as expected behavior.

### Edge Case 2 — User Retakes MBTI

- **Problem:** User wants to redo the test after learning more about themselves.
- **Mitigation:** Add a "Retake cognitive test" button in the MBTI Insight block. It wipes `mbti_type` from `user_profiles`, which causes the MBTI gate in `App.jsx` to show `MBTITest` again on next session check.

### Edge Case 3 — Block Layout Conflict in Collaboration

- **Problem:** Two users in the same collaborative workspace add blocks simultaneously. Their layouts overwrite each other.
- **Mitigation (MVP):** Layouts are per-user (`UNIQUE(roadmap_id, user_id)`), not per-roadmap. Each collaborator has their own block arrangement. Owner can share their layout by exporting it (post-hackathon feature).

### Edge Case 4 — react-grid-layout Mobile Rendering

- **Problem:** Grid blocks on mobile viewports collapse awkwardly.
- **Mitigation:** Set `isDraggable={false}` and `isResizable={false}` when `window.innerWidth < 768`. On mobile, render blocks as a vertical stack instead of a grid.

### Edge Case 5 — Workspace Layout Exceeds 5MB Supabase Row Limit

- **Problem:** User adds 50+ blocks with complex configs and the `layout_json` exceeds the row size limit.
- **Mitigation:** Cap the number of blocks at 20 per workspace. Show an error in `addBlock` if `layout.length >= 20`.

---

## 15. Environment Variables

No changes from v2. All variables are identical.

```env
# server/.env
PORT=3001
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
STELLAR_SECRET_KEY=S...

# client/.env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 16. Deployment Checklist

Add to v2 checklist:

- [ ] Run the v3 SQL in Supabase editor (`workspace_layouts` table + RLS + Realtime publication)
- [ ] Confirm `mbtiProfiles.js` has been created in both `client/src/lib/` and `server/lib/`
- [ ] Test the MBTI test end-to-end: 20 answers → scoring → profile row in Supabase → correct type returned
- [ ] Test workspace persistence: add blocks → refresh → confirm layout reloads
- [ ] Test block add/remove/resize cycle
- [ ] On Vercel: add no new env vars (all from v2 carry over)

---

## 17. GitHub Copilot Prompt Cheatsheet v3

| File | Opening Trigger Comment |
|---|---|
| `server/services/mbtiService.js` | `// MBTI scoring service: 20 forced-choice questions array, scoreMBTI function takes answers array and returns mbtiType string plus 4 dimension integer scores` |
| `client/src/lib/mbtiProfiles.js` | `// MBTI_AI_PROFILES: object mapping all 16 MBTI type strings to cognitiveStyle, explanationApproach, feedbackTone, quizFraming, motivationFrame strings` |
| `client/src/components/auth/MBTITest.jsx` | `// Multi-screen MBTI forced-choice test: 20 questions with A/B buttons, animated progress bar, shows result screen with type name and cognitive style on completion` |
| `client/src/components/workspace/WorkspaceCanvas.jsx` | `// react-grid-layout responsive draggable resizable block canvas with add/remove block controls and debounced layout persistence` |
| `client/src/components/workspace/BlockPalette.jsx` | `// Modal block picker: 2-column grid of block types each with lucide icon, name, description. Calls onSelect with block type ID` |
| `client/src/components/workspace/blocks/TableBlock.jsx` | `// Sortable filterable table view of roadmap nodes: columns for sequence order, title, estimated minutes, status. Click row to select node.` |
| `client/src/components/workspace/blocks/ProgressBlock.jsx` | `// SVG progress ring showing completed/total node percentage, hours done, hours remaining` |
| `client/src/components/workspace/blocks/MBTIInsightBlock.jsx` | `// Displays MBTI type badge, type name, four dimension score sliders, and cognitive style description from MBTI_AI_PROFILES` |
| `client/src/hooks/useWorkspace.js` | `// Custom hook: loads workspace block layout from API on mount, debounced save on layout change, exposes addBlock and removeBlock functions` |
| `server/routes/workspace.js` | `// Express routes: GET and POST /api/workspace/:roadmapId — upserts layout_json in workspace_layouts table per user per roadmap` |

---

*PRD Version 3.0 — Pulse-Learn AI*  
*Adds: MBTI Cognitive Engine · Unified Block Workspace · Market Differentiation Layer*  
*Cumulative: Full Auth · Personalization · Analytics · Multi-User Collaboration · Blockchain Credentials*
