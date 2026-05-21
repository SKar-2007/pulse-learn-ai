# Pulse-Learn AI — Team Summary
### What Are We Building? (Read This First)

Pulse-Learn AI turns any course PDF or syllabus into an interactive **Skill Tree** learning path.  
An AI engine generates the roadmap, quizzes you on each topic, and *adapts the path in real-time* if you fail.  
When you finish the whole course, a blockchain certificate is issued on Stellar's Testnet — permanent and verifiable.

---

## The 3 Core Loops (How The App Works)

```
1. UPLOAD         →   AI breaks it into a Skill Tree        →   Saved to database
2. LEARN & QUIZ   →   AI scores you, adds remediation nodes →   Tree mutates live
3. COMPLETE       →   Stellar blockchain mints a receipt    →   TX hash displayed
```

---

## Tech Stack (What Each Teammate Needs to Know)

| Layer | Technology | Your Job |
|---|---|---|
| **Frontend UI** | React + Vite + Tailwind + Framer Motion | Build the Skill Tree canvas, Quiz panel, Upload form |
| **Backend API** | Node.js + Express | Wire up 3 routes: generate, quiz, verify |
| **Database** | Supabase (PostgreSQL) | Paste the SQL schema, done. Supabase handles auth too |
| **AI Brain** | Google Gemini 1.5 Flash API | Prompt engineering — contracts are already written |
| **Blockchain** | Stellar Testnet SDK | One function call at the end of a course |

---

## Database Tables (What We're Storing)

| Table | What It Holds |
|---|---|
| `users` | Auth accounts (Supabase handles this automatically) |
| `roadmaps` | One row per uploaded syllabus — stores the course title, hours, and Stellar TX hash |
| `nodes` | All the learning steps in the Skill Tree — each knows its status and parent |
| `active_recall_logs` | Every quiz attempt — score + AI feedback recorded here |

**Key concept:** Nodes have a `parent_node_id` field. When you fail a quiz, a new **remediation node** is created pointing back at the node you failed — that's how the tree "mutates."

---

## The 5 Backend API Endpoints

```
POST /api/roadmap/generate      ← Takes a PDF upload, returns a full Skill Tree
GET  /api/roadmap/:id           ← Fetches a roadmap + all its nodes
POST /api/roadmap/:id/complete  ← Triggers the Stellar mint when all nodes are done
POST /api/node/quiz             ← Generates 3 questions for a specific node
POST /api/node/verify           ← Scores the user's answers, inserts remediation if < 70%
```

---

## AI Prompt Rules (Critical — Do Not Change the Output Format)

The Gemini API is called with `responseMimeType: 'application/json'`. This forces it to return clean JSON without any "Sure, here is your JSON..." text. If you remove this setting, `JSON.parse()` will crash.

**Rule for roadmap generation:** Sum of all `estimated_minutes` across nodes must equal `hours × 60`.  
**Rule for scoring:** If score < 70 → `passed: false` + return a `remediation_node` object.  
**Rule for quizzes:** Always return exactly 3 questions.

---

## Stellar Blockchain (What It Actually Does)

We are NOT sending money. We use Stellar's `manageData` operation to attach a key-value string to an account on the **Testnet** (free, not real money). Think of it like writing a sticky note on a public bulletin board that can never be removed.

What gets stored:
```
Key:   PulseLearn_16392847
Value: Docker Containerization | Score: 87%
```

The resulting transaction hash (e.g. `abc123...`) is saved in our `roadmaps` table and shown to the user as their certificate.

**Setup:** Generate a Testnet keypair → fund it via Friendbot URL → paste the secret key in `.env`. Done.

---

## Node Status Flow

```
locked  →  unlocked  →  completed
  ↑            |
  |      (fail quiz)
  |            ↓
  |     remediation node created (unlocked)
  |            |
  |      (pass quiz)
  └────────────┘  (parent node marked completed, next node unlocked)
```

**Remediation cap:** Max 2 remediation nodes per parent. If a user fails 3 times on the same concept, the node is auto-completed with a "Needs Review" flag so progress doesn't stall forever.

---

## File Size & Context Limits

| Limit | Value | Where Enforced |
|---|---|---|
| Max PDF upload size | 15 MB | Multer middleware on the backend |
| Max text sent to Gemini | 50,000 characters | Sliced in the route handler |
| Max remediation depth | 2 levels | `remediation_depth` column checked in route |

---

## Environment Variables You Each Need

**Backend `server/.env`:**
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase project settings
- `GEMINI_API_KEY` — from Google AI Studio (aistudio.google.com)
- `STELLAR_SECRET_KEY` — generate + fund via Friendbot (instructions in PRD Section 7)

**Frontend `client/.env`:**
- `VITE_API_URL` — the backend URL (localhost:3001 in dev, Render URL in prod)
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` — from Supabase project settings

---

## Hackathon Timeline Target

| Hours | Goal |
|---|---|
| 0–4 | Set up repo, install packages, paste SQL into Supabase, test raw Gemini JSON call in isolation |
| 4–16 | Build the frontend dashboard + hook up all 5 API endpoints |
| 16–20 | Integrate Stellar SDK, test TX hash saving to Supabase |
| 20–24 | Deploy backend to Render + frontend to Vercel, record demo video, write README |

---

## Task Split Suggestion (3-Person Team)

| Person | Owns |
|---|---|
| **Person A (Backend)** | All Express routes, Gemini service, Supabase service, Stellar module |
| **Person B (Frontend)** | SkillTree canvas, NodeCard, QuizPanel, Framer Motion animations |
| **Person C (Full-stack glue)** | UploadForm, StellarModal, API wiring in React hooks, deployment |

---

## Quick Sanity Test Sequence

Before building the UI, run these tests in order to validate each layer works:

1. **Supabase test:** Insert a fake row into `roadmaps` from Supabase dashboard → confirm it appears.
2. **Gemini test:** Run `geminiService.generateRoadmapFromText("Learn Python basics", 5)` in isolation → confirm clean JSON output.
3. **Full flow test:** POST to `/api/roadmap/generate` with a small TXT file → confirm nodes appear in Supabase.
4. **Quiz test:** POST to `/api/node/quiz` with a real node ID → confirm 3 questions come back.
5. **Stellar test:** Run `mintProofOfKnowledge("Test Course", 90)` directly → check Stellar Expert Testnet for the TX.

Once all 5 pass, the UI is just wiring existing data to components.

---

*Summary Doc v1.0 — Pulse-Learn AI*
