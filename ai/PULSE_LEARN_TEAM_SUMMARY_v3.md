# Pulse-Learn AI — Team Summary v3
### Three New Things In This Version

1. **MBTI replaces the personality wizard** — a proper 20-question forced-choice cognitive test, taken once at signup, drives every AI output for that user forever.
2. **Unified block workspace** — the entire app is now one composable canvas. No more separate pages. Skill tree, quiz, charts, notes, and progress all live as drag-and-drop, resizable blocks in one environment — like Microsoft Loop or Notion, but for adaptive learning.
3. **Clear market differentiation** — we now have a tight, defensible answer to "how is this different from Ollama / ChatGPT / Coursera / Notion AI?"

---

## Why MBTI and How It Works

### The Problem With the Old Onboarding
The v2 wizard asked "how do you learn best?" — a question people often answer based on what sounds good rather than how they actually think. It also only covered surface preferences.

### What MBTI Measures
MBTI forces two-choice decisions across 4 cognitive dimensions. There's no "good" answer — it's purely about preference. The result is a 4-letter type (e.g. INTJ, ENFP) from 16 possibilities.

| Dimension | Two Poles | What It Tells the AI |
|---|---|---|
| E / I | Extraversion vs Introversion | Social framing of examples (collaborative vs solo) |
| N / S | iNtuition vs Sensing | Concept-first vs fact-first explanations |
| T / F | Thinking vs Feeling | Analytical vs human-impact framing |
| J / P | Judging vs Perceiving | Structured milestone path vs exploratory flow |

### The Test Flow
- 20 questions, 4 per dimension
- Forced choice (A or B — no "both" option)
- Score tallied server-side via `scoreMBTI(answers)` in `mbtiService.js`
- Type stored in `user_profiles.mbti_type`
- Shown once only — retake available from MBTI Insight block

### How It Connects to the AI
Every call to Gemini now starts with a block like this (constructed by `buildPersonalityContext(profile)`):

```
=== LEARNER COGNITIVE PROFILE (MBTI: INTJ — The Architect) ===
Cognitive Style: Systems thinker. Values efficiency and logical coherence.
How to explain: Lead with the theoretical framework, use precise technical vocabulary.
How to frame quizzes: Test edge cases and second-order effects.
How to give feedback: Direct and analytical. State the flaw, the correct chain, move on.
How to motivate: Frame as long-term strategic leverage. Don't sell motivation.
================================================================
```

This goes at the top of the roadmap generation prompt, the quiz question prompt, and the scoring/feedback prompt. Every piece of AI output is calibrated to the learner's cognitive type — not their stated preference, but their demonstrated behavioral preference from the test.

---

## The Unified Block Workspace

### What It Is
Instead of navigating between separate pages (Tree → Quiz → Analytics), everything lives on one canvas. The user builds their own learning environment from blocks, just like assembling a Notion page or a Microsoft Loop workspace.

### The 7 Block Types

| Block | What It Shows |
|---|---|
| 📊 Skill Tree | The interactive visual learning path with node cards |
| 📈 Analytics Chart | Natural language query → instant chart (line, bar, pie, etc.) |
| 📋 Node Table | Spreadsheet view of all nodes, sortable by status/time/score |
| 🧪 Quiz Panel | Take the active recall quiz for the selected node, inline |
| 📝 Team Notes | Collaborative Tiptap rich text editor for the whole team |
| 📈 Progress Overview | Completion ring + hours done vs remaining |
| 🧬 MBTI Insight | Live display of your cognitive type with 4 dimension sliders |

### How Blocks Work
- Click **"Add Block"** → Block Palette appears → click a type → block appears on the canvas
- **Drag** blocks by their header bar to reposition
- **Resize** blocks from any corner/edge
- Layout is **auto-saved** 2 seconds after any change (debounced) to Supabase
- Each collaborator has their own layout — your workspace arrangement is personal

### New NPM Packages for This Feature
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit react-grid-layout react-resizable
```

---

## How We're Different (The Differentiation Layer)

This is what you say when someone asks "how is this different from X?"

### vs Ollama
> "Ollama is an LLM runner — it runs models locally. It has no curriculum, no quiz engine, no user identity, no skill tree, no blockchain. It's like comparing a database engine to an application. Ollama is the engine. We're the product."

### vs ChatGPT / Claude
> "ChatGPT is stateless. It forgets you failed the quiz 5 minutes ago. Pulse-Learn maintains a full stateful model of your learning — your cognitive type, your path, your scores, your adaptive branches — across every session."

### vs Notion AI
> "Notion AI writes and summarizes inside your documents. It has no concept of a learning path, a quiz, a skill score, or curriculum adaptation. It's a writing assistant. We're a learning OS."

### vs Coursera / EdX
> "Their curriculum is static and universal. Whether you're a beginner or an expert, a visual or analytical thinker — you get the same video. Ours rewrites itself based on your cognitive type and your quiz performance. And our credentials live on a public blockchain, not their private server."

### vs Duolingo
> "Duolingo does one domain (language) with one fixed content library. We work on any document you upload — thesis outlines, company onboarding PDFs, university syllabi. And we support team learning, which Duolingo has no concept of."

### The One-Line Pitch
> **"Pulse-Learn is a Learning OS — it converts any document into a cognitively personalized, live-mutating skill tree that your team can work on together in a composable block workspace, with blockchain-verified credentials."**

### The Competitive Matrix (For Your README / Demo Slide)

| Feature | Pulse-Learn | ChatGPT | Ollama | Notion AI | Coursera |
|---|---|---|---|---|---|
| Custom doc → adaptive path | ✅ | ❌ | ❌ | ❌ | ❌ |
| MBTI cognitive personalization | ✅ | ❌ | ❌ | ❌ | ❌ |
| Live path mutation on failure | ✅ | ❌ | ❌ | ❌ | ❌ |
| Team collaborative learning | ✅ | ❌ | ❌ | ✅ | ❌ |
| Composable block workspace | ✅ | ❌ | ❌ | ✅ | ❌ |
| Blockchain credential | ✅ | ❌ | ❌ | ❌ | ❌ |
| Natural language analytics | ✅ | Partial | ❌ | Partial | ❌ |

---

## New Database Tables (v3 Additions)

Only 2 changes from v2:

**`user_profiles`** — same table, updated columns:
- `mbti_type TEXT` — the 4-letter result (e.g. "ENFP")
- `ei_score INT`, `sn_score INT`, `tf_score INT`, `jp_score INT` — raw dimension scores
- `learning_style`, `expertise_level`, `communication_tone` columns from v2 are **removed** — MBTI replaces them

**`workspace_layouts`** — new table:
- One row per user per roadmap
- Stores the full block layout as JSONB (`layout_json`)
- Enables each collaborator to have their own personal block arrangement

---

## Updated App Flow (New User)

```
1. Sign up → Supabase Auth → users row auto-created
2. App checks /api/user/profile → mbti_type is null
3. MBTITest component loads — 20 questions, animated transitions
4. On completion: answers scored server-side → 4-letter type returned
5. Results screen shows type name + cognitive style
6. Profile saved with mbti_type → WorkspaceCanvas loads
7. Default workspace: Skill Tree block + Progress block + MBTI Insight block
8. User uploads PDF → roadmap generated with MBTI-personalized node summaries
9. User adds Chart block → types "show my scores as line chart" → chart appears
10. User invites teammate → teammate joins workspace with their own layout
11. Teammate completes a node → Skill Tree block updates live for everyone
12. All nodes complete → Stellar TX minted → StellarModal appears
```

---

## Task Split for v3 (3-Person Team)

| Person | Owns in v3 |
|---|---|
| **Person A (Backend + AI)** | `mbtiService.js` (scoring), updated `buildPersonalityContext`, `workspace.js` route, updated `user.js` for MBTI endpoint |
| **Person B (Frontend — Workspace + Blocks)** | `WorkspaceCanvas.jsx`, `BlockPalette.jsx`, all 7 block components, `useWorkspace.js` hook, `react-grid-layout` setup |
| **Person C (Frontend — Auth + MBTI + Collab)** | `MBTITest.jsx`, `mbtiProfiles.js`, updated `App.jsx` auth gate, `CollabSidebar.jsx`, `PresenceBar.jsx` |

---

## Critical Things Not to Break

| Action | What breaks | Prevention |
|---|---|---|
| Removing `mbti_type` from `buildPersonalityContext` check | AI gets no personality context — falls back to generic | The `if (!userProfile?.mbti_type) return ''` check is intentional — keep it |
| Using `window.localStorage` in block components | Blocks must persist via the API, not browser storage | All state goes through `useWorkspace` → `/api/workspace` |
| Answering fewer than 20 MBTI questions | Backend returns 400, no profile created, user loops forever | Frontend disables Submit until `answers.length === 20` |
| Skipping the `react-resizable` CSS import | Blocks will render without resize handles — invisible but broken | `import 'react-resizable/css/styles.css'` in main.jsx |
| MBTI type validation on server | Invalid type string crashes the `MBTI_AI_PROFILES[type]` lookup | Validate against the 16-type array before DB write |

---

*Summary Doc v3.0 — Pulse-Learn AI*  
*MBTI Cognitive Engine · Unified Block Workspace · Market Differentiation*
