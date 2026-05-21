# Pulse-Learn AI — Team Summary v2
### What Are We Building? (Read This First)

Pulse-Learn AI turns any course PDF or syllabus into an interactive **Skill Tree** learning path.
Three major upgrades in v2: the AI now **knows who you are** and talks to you accordingly, you can **query your own learning data in plain English** and get charts instantly, and multiple people can **work on the same roadmap live** — like Google Docs but for studying.

---

## The 3 New Features in Plain English

### Feature 1 — Personalization
When you first sign up, a 5-question wizard asks about your learning style, expertise level, and preferred tone.
Every single AI call — roadmap generation, quiz questions, scoring feedback — uses that profile.
A beginner gets analogies and simple language. An expert gets dense technical precision. A "Socratic" learner gets questions inside their explanations, not just answers.

### Feature 2 — Natural Language Analytics
There's an Analytics tab where you type a question like:
- *"Show my quiz scores over time"* → Line chart appears instantly
- *"Which nodes did I struggle with most?"* → Horizontal bar chart
- *"Compare my performance across roadmaps"* → Bar chart
Gemini reads your raw quiz log data, decides the right chart type, builds a Recharts config, and the frontend renders it. No hardcoded dashboard — it's fully generative.

### Feature 3 — Multi-User Collaboration
A roadmap owner can invite teammates by email and assign them `editor` or `viewer` roles.
When any editor completes a node or fails a quiz (triggering a remediation node), **everyone sees the tree update live** — no refresh needed, powered by Supabase Realtime.
Nodes can be assigned to specific people. Each node shows an avatar of who owns it. Collaborators can leave inline comments on any node.

---

## Updated Tech Stack

| Layer | Technology | What's New in v2 |
|---|---|---|
| Auth | Supabase Auth | Email + Google OAuth. JWT passed to all API calls. |
| Database | Supabase (PostgreSQL) | 3 new tables: `user_profiles`, `roadmap_collaborators`, `node_comments` |
| AI Engine | Gemini 1.5 Flash | All prompts now receive a `personalityContext` block from the user's profile |
| Charts | Recharts | New — renders dynamic bar, line, pie, radar, area charts from Gemini-generated configs |
| Real-Time | Supabase Realtime | New — live node status sync across all collaborators via WebSocket channels |
| Frontend | React + Framer Motion | New: Personality Onboarding wizard, Analytics Dashboard, Collaboration Sidebar |

---

## Updated Database Tables

| Table | What It Holds | New in v2? |
|---|---|---|
| `users` | Auth accounts, auto-created on signup via DB trigger | Updated — now auto-syncs from Supabase Auth |
| `user_profiles` | Learning style, expertise, tone, domain, session length | ✅ New |
| `roadmaps` | One per course, now has `is_collaborative` flag | Updated |
| `roadmap_collaborators` | Who has access, with what role (owner/editor/viewer) | ✅ New |
| `nodes` | Skill tree steps — now has `assigned_to` and `last_updated_by` | Updated |
| `active_recall_logs` | Quiz attempts with scores and AI feedback | Unchanged |
| `node_comments` | Inline comments per node for async collaboration | ✅ New |

---

## How Personalization Actually Works (The Important Technical Bit)

The key function is `buildPersonalityContext(profile)` in `geminiService.js`.
It converts the 5-question profile into a formatted instruction block that looks like this:

```
=== LEARNER PERSONALITY PROFILE ===
Expertise Level: beginner
→ Assume zero prior knowledge. Define every technical term when first used.

Communication Tone: friendly
→ Use warm, encouraging language. Celebrate small wins.

Learning Style: kinesthetic
→ Ground every concept in a concrete example. Lead with the example, explain after.

Domain: computer_science
→ Use programming, systems, and algorithm analogies where possible.

Preferred Session: 30 minutes
→ Bias node time estimates toward 30-minute chunks.
====================================
```

This block gets prepended to **every prompt** — roadmap generation, quiz questions, and evaluation feedback. That's the entire personalization system. One function, injected everywhere.

---

## How the Analytics Work

```
User types: "Show my quiz scores as a line chart"
         ↓
Backend fetches ALL their active_recall_logs + node data from Supabase
         ↓
Sends raw data + query to Gemini
         ↓
Gemini returns: { chartType: "line", data: [...], title: "...", description: "..." }
         ↓
Frontend passes this to ChartRenderer.jsx
         ↓
ChartRenderer picks the right Recharts component and renders it
```

The frontend never hardcodes any chart. Everything is driven by what Gemini returns. The `ChartRenderer` component handles 6 types: `line`, `bar`, `horizontalBar`, `pie`, `radar`, `area`.

---

## How Real-Time Collaboration Works

```
User A completes a node → POST /api/node/verify → node status updated to "completed" in Supabase
                                                         ↓
                                         Supabase Realtime broadcasts UPDATE event
                                                         ↓
User B's browser receives the event via WebSocket (useRealtime hook)
                                                         ↓
User B's skill tree re-renders with the updated node — no refresh needed
```

The `useRealtime` hook in `hooks/useRealtime.js` manages this subscription. It subscribes to `postgres_changes` on the `nodes` table filtered by `roadmap_id`. When a node changes, the hook calls `onNodeUpdate(updatedNode)` which patches the local React state.

**Presence** (who is looking at which node right now) uses Supabase's built-in Presence API — it's a WebSocket broadcast, not a DB write, so it's zero-latency.

---

## Role Permission Model

| Action | Owner | Editor | Viewer |
|---|---|---|---|
| View the skill tree | ✅ | ✅ | ✅ |
| Take quizzes + submit answers | ✅ | ✅ | ❌ |
| Mark nodes complete | ✅ | ✅ | ❌ |
| Invite collaborators | ✅ | ❌ | ❌ |
| Assign nodes to users | ✅ | ❌ | ❌ |
| Add comments | ✅ | ✅ | ✅ |
| Trigger Stellar mint | ✅ | ❌ | ❌ |

The role check happens **server-side** in the `/api/node/verify` route. Hiding a button on the frontend is UX — enforcing it on the backend is security.

---

## New API Endpoints (Added in v2)

```
GET  /api/user/profile           ← Returns personality profile (null if not set)
POST /api/user/profile           ← Saves onboarding answers

POST /api/analytics/query        ← NL query → Recharts config JSON

POST /api/collab/invite          ← Owner invites teammate by email
GET  /api/collab/:roadmap_id     ← List all collaborators + roles
PATCH /api/collab/node/assign    ← Assign node to a user
POST /api/collab/comment         ← Add comment to a node
```

---

## App Flow for a New User

```
1. Land on site → LoginForm (email/password or Google)
2. Supabase Auth creates account → DB trigger auto-creates users row
3. App checks /api/user/profile → returns null
4. PersonalityOnboarding wizard appears (5 screens)
5. Profile saved → Dashboard loads
6. User uploads a PDF + enters hours → personalized Skill Tree generated
7. User clicks a node → personalized quiz loads → personalized feedback
8. If failed → remediation node appears (all collaborators see it live)
9. Analytics tab → type "show my scores" → chart appears
10. Complete all nodes → Stellar TX minted → certificate modal
```

---

## Task Split Suggestion (3–4 Person Team)

| Person | Owns |
|---|---|
| **Person A (Backend + AI)** | Auth middleware, all routes, geminiService with personality context, analyticsService |
| **Person B (Frontend — Tree + Quiz)** | SkillTree, NodeCard, QuizPanel, StellarModal, UploadForm |
| **Person C (Frontend — Auth + Analytics)** | LoginForm, PersonalityOnboarding, AnalyticsDashboard, ChartRenderer, App.jsx auth gate |
| **Person D (Realtime + Collab) [optional]** | useRealtime hook, CollabSidebar, PresenceBar, collab routes |

If you're a 3-person team: Person C also takes Realtime + Collab.

---

## Sanity Test Sequence (Run Before Touching the UI)

1. **Auth test:** Sign up via Supabase → confirm `users` row auto-created in DB
2. **Profile test:** POST to `/api/user/profile` with sample data → confirm row in `user_profiles`
3. **Personalization test:** Call `generateRoadmapFromText` with a `beginner + socratic` profile vs `expert + direct` profile on the same text — confirm the summaries are noticeably different
4. **Analytics test:** Insert 5 fake `active_recall_logs` rows → POST `"show my scores as line chart"` → confirm valid chart config returns
5. **Realtime test:** Open two browser tabs logged in as different users on the same roadmap → complete a node in Tab 1 → confirm Tab 2's tree updates without refresh
6. **Collab invite test:** Invite a second user by email → confirm row appears in `roadmap_collaborators` → confirm `is_collaborative` is `true` on the roadmap

---

## Important: Things That Will Break If You Skip Them

| Thing | What breaks | Fix |
|---|---|---|
| Not running `ALTER PUBLICATION supabase_realtime ADD TABLE nodes` | Real-time updates won't fire | Run the SQL in Supabase editor |
| Putting `SUPABASE_SERVICE_ROLE_KEY` in client `.env` | Full DB access exposed publicly | Only use it in `server/.env` |
| Removing `responseMimeType: 'application/json'` from Gemini model | `JSON.parse()` crashes randomly | Keep it on every model instance |
| Not using `requireAuth` middleware on analytics/collab routes | Any user can query anyone else's data | All non-auth routes should return 401 |
| Not checking `remediation_depth < 2` before inserting remediation | Infinite loop of child nodes | Already in the route — don't remove it |

---

*Summary Doc v2.0 — Pulse-Learn AI*
*Adds: Personality-Driven Personalization + Natural Language Analytics + Multi-User Real-Time Collaboration*
