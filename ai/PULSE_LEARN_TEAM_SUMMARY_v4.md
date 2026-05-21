# Pulse-Learn AI — Team Summary v4
### The Big Shift in This Version

v4 is a **complete architectural rethink of the frontend**. The product is no longer a dashboard with glowing quiz cards. It is a **document-first collaborative workspace** — the same structural model as Microsoft Loop and Notion, but built for learning.

Everything the previous versions split into separate pages (Skill Tree page, Analytics page, Quiz panel, Collaboration sidebar) now lives as **blocks inside a document**. The user writes, inserts AI-powered blocks inline via a slash command, and the AI panel on the right is always available in context without navigating away.

---

## The New Mental Model

**Old model (v1–v3):** App with multiple pages → navigate to Skill Tree → navigate to Analytics → open Quiz modal

**New model (v4):** A workspace with pages → open a page → write and insert any block inline → AI panel on the right answers questions about the page content

The metaphor is not "an app with features." It is "a document environment where features are blocks you insert where you need them."

---

## The Three-Panel Shell

The entire application lives in this layout — identical to Loop:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR  [≡]  Workspace > Page title          [share] [AI] [···]  [avatars]  │
├──────────────┬───────────────────────────────────────────────────────────────┤
│              │                                │                             │
│ LEFT PANEL   │   MAIN CONTENT (document)      │   RIGHT PANEL (AI chat)     │
│ 240px        │   max-width 780px, centered    │   320px, collapsible        │
│              │                                │                             │
│ Search       │   # Page title                 │   Quick actions:            │
│              │                                │   - Summarize this page     │
│ Pages        │   Type here or / for blocks    │   - Build study plan        │
│  └ Sub page  │                                │   - Analyze my data         │
│  └ Sub page  │   [Learning Graph block]       │                             │
│              │   [Chart block]                │   ─────────────────         │
│ Recent       │   [Progress block]             │   [conversation thread]     │
│ Settings     │   [Notes text]                 │                             │
│              │                                │   [input bar at bottom]     │
└──────────────┴────────────────────────────────┴─────────────────────────────┘
```

All three panels are collapsible. The grid uses `grid-template-columns` CSS — no JS layout engine.

---

## The Design Language (What Changed)

The previous UI used glowing borders, heavy gradients, and pulse animations to communicate everything. The new design uses the same vocabulary as Loop and Notion:

| Element | Old | New |
|---|---|---|
| Colors | Multiple accent colors, glowing indigo everywhere | One accent (#7c6af5), used only for active state and one CTA |
| Borders | Heavy `border-2`, colored | `1px solid #2a2a2a` — barely visible, just structural |
| Node cards | Glassmorphism cards with glow | Database table rows with a dot indicator |
| Backgrounds | Gradient overlays, colored panels | #0f0f0f base, #171717 panels, #1f1f1f hover — three values only |
| Animations | Pulse on active nodes, bounce on everything | Slash menu fade-in, AI panel slide-in — that's it |
| Typography | Mixed sizes, many weights | 13px for UI, 15px for body, 32px for page titles — three values |
| Modals | Full-screen modal for quiz, full-screen for completion | No full-screen modals. Completion is an inline badge in the page |

---

## Block System — What Pressing `/` Does

The entire feature set is accessible from the slash command palette. You don't navigate to a feature — you insert it where you need it.

| Block | What it inserts |
|---|---|
| `Text`, `Heading`, `List`, `Divider`, `Quote`, `Code` | Standard document elements |
| `Learning Graph` | Upload any document → AI generates a structured knowledge table with status tracking |
| `Data Table` | An editable table where you can type NL queries to filter/sort/visualize |
| `Progress Tracker` | Live completion percentage across all nodes in the workspace |
| `Knowledge Check` | One inline concept verification — not a quiz panel, just a focused check |
| `AI Summary` | Summarizes selected content in your cognitive style |
| `Chart` | Type a question, get a recharts visualization inline |
| `Board view` | Kanban view of any table in the page |
| `Timeline` | Date-based view of tasks or milestones |

---

## Learning Graph Block (Replaces "Skill Tree" as a Concept)

The `LearningGraphBlock` is what was previously called the Skill Tree — but completely redesigned. Instead of animated node cards connected by SVG lines, it renders as a **Notion-style database table**:

```
Learning Graph                              [table] [list]
─────────────────────────────────────────────────────────
#    Concept                     Time    Status          Score
1    Docker fundamentals         30m     ● Ready         —
2    Container networking        45m     ● Not started   —
3    Volumes & persistence       30m     ○ In progress   72%
4    Multi-container compose     60m     ● Complete      88%
     ↳ Remediation: Bind mounts  15m     ● Ready         —
5    Production deployment       45m     ○ Not started   —
─────────────────────────────────────────────────────────
+ New concept
```

Status is communicated with a small colored dot (no text animation, no glow):
- `#2a2a2a` — Not started
- `#7c6af5` — Ready
- `#e8a838` — In progress
- `#3d9970` — Complete
- `#c0392b` — Needs review

---

## AI Panel — Not a Chatbot Page

The AI panel is a **context panel** — it knows what page you are on and what content blocks are in it. It is not a general-purpose chatbot and it is not a separate page.

- Type a question → the AI reads the page content and responds
- Hit "Insert into page" → the response drops in as a new block at the cursor position
- Quick action buttons when empty: Summarize, Build study plan, Explain, Generate questions, Analyze data, Create outline
- The input field has `Shift+Enter` for newlines and `Enter` to send

---

## What Was Removed

| v3 feature | What happened in v4 |
|---|---|
| `react-grid-layout` | Removed entirely. Blocks are vertical document items, not a draggable canvas. |
| Separate Analytics page | Replaced by the inline `ChartBlock` — insert anywhere in the document |
| Full-screen StellarModal with confetti | Replaced by a small inline `StellarCompletionBadge` that sits in the page |
| Full-screen quiz panel | Replaced by `KnowledgeCheckBlock` — inline in the document, not a modal |
| Pulsing glow animations on node cards | Replaced by a colored status dot next to a table row |
| Separate collaboration sidebar | Replaced by presence avatars in the topbar + inline block comments |

---

## New Database Tables (v4)

| Table | Purpose |
|---|---|
| `workspaces` | Top-level container — like a Loop workspace |
| `workspace_members` | Who has access + role (owner/editor/viewer) |
| `pages` | The document units inside a workspace. Stores `content_blocks` as JSONB |
| `page_comments` | Block-level inline comments with resolved state |

The existing `roadmaps`, `nodes`, `user_profiles`, `active_recall_logs` tables all remain unchanged.

---

## New API Endpoints (v4)

```
GET    /api/workspace/:id/pages   ← List all pages in a workspace
POST   /api/pages                 ← Create a new page
GET    /api/pages/:id             ← Fetch page with content_blocks
PATCH  /api/pages/:id             ← Update title or blocks JSON
DELETE /api/pages/:id             ← Delete page

POST   /api/ai/page-chat          ← Context-aware AI response for current page
POST   /api/ai/inline             ← Generate inline content from a slash command
```

---

## Task Split (3-Person Team)

| Person | Owns |
|---|---|
| **Person A (Backend)** | `pages.js` route, `ai.js` route (page-chat endpoint), workspace/member routes, updated Gemini service with page context |
| **Person B (Shell + Sidebar + AI Panel)** | `AppShell.jsx`, `TopBar.jsx`, `LeftSidebar.jsx`, `PageTreeItem.jsx`, `AIPanel.jsx`, `PresenceAvatars.jsx` |
| **Person C (Block Editor + Blocks)** | `MainContent.jsx`, `SlashMenu.jsx`, `BlockRenderer.jsx`, all individual block components |

---

## Critical Things That Must Not Be Skipped

| Rule | Why |
|---|---|
| `content_blocks` stores only block references, not full data | A `{ type: 'learning_graph', roadmap_id: 'uuid' }` block fetches data dynamically. Storing full graph JSON in the page column will break at scale. |
| Slash menu must close on `Escape` and on scroll | Otherwise it floats detached from the cursor position |
| The AI panel reads the current page's block content, not a global user history | Each `/api/ai/page-chat` call receives `page_content` in the request body |
| No `box-shadow` with color, no `animate-pulse` on status indicators | These are the two most visible anti-patterns from v3. Status = dot color, not animation. |
| Presence avatars are in the topbar, not a floating sidebar | Inline collaboration indication is less intrusive and matches Loop's UX |

---

*Summary Doc v4.0 — Pulse-Learn AI*  
*Document-first architecture · Loop/Notion visual language · Ambient AI · Inline block system*
