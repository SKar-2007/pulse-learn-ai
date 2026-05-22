# Pulse-Learn — UI Design Specification
## Part 2: Collaboration · MCP Plugins · MBTI AI · Loop Components · Notion AI · Stellar

> **Continuation of Part 1.** All color tokens, typography, spacing, button variants, and "what we do not use" rules carry over exactly. This document only adds new surfaces and patterns — it does not redefine anything from Part 1.

---

## 17. Multi-User Collaboration — Presence & Shared Workspace

The entire collaboration model surfaces as **quiet indicators** on the existing canvas. No new pages, no separate "collaboration mode." Other people just... appear.

### 17.1 Presence Bar — Top of Workspace

Sits in the same top bar row as `[Recap] [Search] [Share] [⋯]`, left of those actions.

```
Docker Mastery          [AK] [SR] [+2]        [Recap] [Search] [Share] [⋯]
                         ↑ avatars              ↑ existing actions (unchanged)
```

```css
/* Avatar stack — overlapping circles */
.presence-stack {
  display: flex;
  align-items: center;
}

.presence-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);   /* Gap between avatars */
  background: var(--bg-active);
  font-size: 9px;
  font-weight: var(--weight-semibold);
  font-family: var(--font-mono);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  margin-left: -6px;                     /* Overlap */
  position: relative;
}

.presence-avatar:first-child { margin-left: 0; }

/* Online pulse — 4px dot at bottom-right of avatar */
.presence-avatar::after {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-primary);
  border: 1.5px solid var(--bg-primary);
  position: absolute;
  bottom: -1px;
  right: -1px;
}

/* Overflow count: +2, +5 etc */
.presence-overflow {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
  background: var(--bg-tertiary);
  font-size: 9px;
  color: var(--text-faint);
  font-family: var(--font-mono);
  margin-left: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Hover on any avatar shows a tooltip: `Anika K. — viewing Overview` in a minimal pill tooltip.

```css
.presence-tooltip {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: var(--text-primary);
  color: var(--bg-primary);
  font-size: var(--text-xs);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  pointer-events: none;
  z-index: 50;
}
```

---

### 17.2 Collaborative Cursor — Other Users on Canvas

When another user is on the same workspace page, their cursor appears as a **labelled line** — no colored dot, no emoji cursor. Same monotone grammar.

```
          │
          │  Anika             ← name tag 2px below cursor tip
          ↓
```

```css
.collab-cursor {
  position: absolute;
  pointer-events: none;
  z-index: 60;
}

.collab-cursor-line {
  width: 1px;
  height: 16px;
  background: var(--text-muted);
}

.collab-cursor-label {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-primary);
  background: var(--bg-active);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
  white-space: nowrap;
  margin-top: 2px;
}
```

No color-coding users. Everyone gets `var(--text-muted)` cursors. Identity is the name label.

---

### 17.3 Collaborator Sidebar (Click on Presence Stack)

Clicking the avatar stack opens a slide-in panel from the right — same 300px panel pattern as the AI Assistant Sidebar (Part 1 §8). They do not coexist. Opening one closes the other.

```
┌────────────────────────────────────────────────────────────┐
│  People                                              [×]   │
│────────────────────────────────────────────────────────────│
│                                                            │
│  ON THIS PAGE                                              │
│                                                            │
│  ● AK   Anika Kapoor          Overview             Owner  │
│  ● SR   Sam Rowan             Week 1               Editor │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  INVITE                                                    │
│  ┌──────────────────────────────────────────────┐         │
│  │  Email address...                     [Send] │         │
│  └──────────────────────────────────────────────┘         │
│                                                            │
│  Role for new invite:   [Viewer ∨]                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```css
/* Section labels inside the panel — same pattern as search result groups */
.panel-section-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 14px 16px 6px;
}

.collab-person-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: var(--text-sm);
}

.collab-person-location {
  font-size: var(--text-xs);
  color: var(--text-faint);
  font-family: var(--font-mono);
  flex: 1;
  text-align: right;
}

.collab-person-role {
  font-size: var(--text-xs);
  color: var(--text-faint);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
}
```

---

### 17.4 Node Assignment

In the Table Block, each node row gets an assignment column. Clicking the cell opens a mini dropdown of current collaborators.

```
│ Node 3 — Dockerfile Basics  │ 60m │ in_progress │ AK ∨ │
                                                     ↑ click

  ┌──────────────────┐
  │  AK  Anika K.    │
  │  SR  Sam R.      │
  │  ─────────────   │
  │  Unassigned      │
  └──────────────────┘
```

```css
.assignment-cell {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-muted);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 100ms;
}
.assignment-cell:hover { border-color: var(--border-strong); color: var(--text-primary); }
```

---

### 17.5 Comments on Nodes

Hover any node row in the Skill Tree Block → a `[  ]` comment icon appears at the far right. Click to open an inline comment thread below the row — same pattern as Linear's comment threads, not a modal.

```
● Node 3 — Dockerfile Basics     ⚡  60m    [💬 2]
  ──────────────────────────────────────────────────
  SR  "Should we add a section on multi-stage?"   2h ago
  AK  "Yes — adding it as a sub-node"             1h ago
  ──────────────────────────────────────────────────
  [  Reply...                                    ↑ ]
```

```css
.comment-thread {
  margin: 0 16px 8px;
  border-left: 1px solid var(--border);
  padding-left: 12px;
}

.comment-row {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  border-bottom: 1px solid var(--border);
}

.comment-author {
  font-family: var(--font-mono);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  flex-shrink: 0;
}

.comment-time {
  color: var(--text-faint);
  margin-left: auto;
  flex-shrink: 0;
}

.comment-input-row {
  display: flex;
  gap: 8px;
  padding: 8px 0 4px;
  align-items: center;
}
```

---

## 18. MCP Plugin Panel

MCP connections are not buried in settings. They live in a **dedicated panel**, reachable from the `[⋯]` workspace menu → `Connections`.

### 18.1 Connection Entry Point

```
[⋯] menu on workspace top bar:
┌─────────────────────────────┐
│  🔁  Recap this page        │
│  🎨  Workspace settings     │
│  🔌  Connections            │  ← new item
│  📋  Save as template       │
│  ─────────────────────────  │
│  🗑  Delete roadmap         │
└─────────────────────────────┘
```

### 18.2 Connections Panel Layout

Same 300px slide-in panel, same header pattern.

```
┌────────────────────────────────────────────────────────────┐
│  Connections                                         [×]   │
│────────────────────────────────────────────────────────────│
│                                                            │
│  CONNECTED                                                 │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  📅  Google Calendar          Connected    [Manage]  │ │
│  │      Last sync: 4 min ago                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  🐙  GitHub                   Connected    [Manage]  │ │
│  │      Linked: monorepo/pulse-learn                    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  AVAILABLE                                                 │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  💬  Slack                                [Connect]  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  📝  Notion                               [Connect]  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  🎨  Figma                                [Connect]  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```css
.connection-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin: 0 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 120ms;
}

.connection-card:hover { border-color: var(--border-strong); }

.connection-card-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.connection-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.connection-name {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  flex: 1;
}

.connection-status {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-faint);
}

/* Connected status — same mono, just slightly brighter */
.connection-status.connected { color: var(--text-secondary); }

.connection-subtitle {
  font-size: var(--text-xs);
  color: var(--text-faint);
  padding-left: 23px;    /* Aligns with name, after icon + gap */
  font-family: var(--font-mono);
}
```

The `[Connect]` and `[Manage]` buttons follow the `btn-ghost` pattern from Part 1 §10.

---

### 18.3 Manage Connection Sheet

Clicking `[Manage]` on a connected service expands an inline detail area below the card — not a new panel, not a modal. It slides open within the same card.

```
┌──────────────────────────────────────────────────────────┐
│  📅  Google Calendar          Connected      [Manage ∧]  │
│      Last sync: 4 min ago                                │
│──────────────────────────────────────────────────────────│
│  AUTOMATIONS USING THIS CONNECTION                       │
│  ● Node complete → Create calendar event                 │
│                                                          │
│  IMPORT                                                  │
│  [Pull upcoming events as timeline block]                │
│                                                          │
│  [Disconnect]                                            │
└──────────────────────────────────────────────────────────┘
```

The `[Disconnect]` button is `btn-ghost` with `color: var(--text-muted)`. It does NOT become red on hover — stays muted, becomes `var(--text-primary)` on hover. Destructive confirmation happens as inline text below: `Confirm disconnect? [Yes] [Cancel]` — no modal.

---

### 18.4 Automation Rules — Inside Workspace Settings

Workspace settings is its own full-width page (replaces canvas when opened, back arrow returns). Automation rules live here.

```
← Docker Mastery

WORKSPACE SETTINGS

  General
  ──────────────────────────────────────────────────────────
  Title           [Docker Mastery                         ]
  Icon            [🐋 ∨]

  Automations
  ──────────────────────────────────────────────────────────

  WHEN                         THEN                [+ Rule]
  ─────────────────────────────────────────────────────────
  Node completed          →    Post to #learning   [⋯] [×]
  Quiz score < 60%        →    Create GitHub issue [⋯] [×]
  ─────────────────────────────────────────────────────────

  Danger
  ──────────────────────────────────────────────────────────
  [Delete this roadmap]
```

```css
.settings-section-title {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 24px 0 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}

.automation-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.automation-arrow {
  font-family: var(--font-mono);
  color: var(--text-faint);
  font-size: var(--text-xs);
}

.automation-trigger,
.automation-action {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
```

**`[+ New Rule]` flow:** Clicking it inserts a new empty row inline — two `select` dropdowns (WHEN / THEN), both using the minimal select style below:

```css
.minimal-select {
  appearance: none;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 5px 28px 5px 10px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238a8a85' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}

.minimal-select:focus {
  outline: none;
  border-color: var(--border-strong);
}
```

---

## 19. MBTI-Personalised AI Chatbot

The AI Assistant sidebar (Part 1 §8) gets the full MBTI treatment visually. The user should *feel* the difference — not read a disclaimer about it.

### 19.1 Session Header — Shows Active Personality

The sidebar header no longer just says "AI Assistant." It shows the active cognitive mode.

```
┌────────────────────────────────────────────────────────────┐
│  AI  INTJ mode                                       [×]   │
│      The Architect · Direct · Systems-first                │
└────────────────────────────────────────────────────────────┘
```

```css
.ai-sidebar-mode-label {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-faint);
  margin-top: 2px;
  letter-spacing: 0.04em;
}
```

That's it. One extra line of mono text below the title. No badge, no color, no icon.

---

### 19.2 Empty State — Personalised Quick Prompts

When there are no messages yet, show 4 quick-prompt chips tuned to the MBTI type. An INTJ sees:

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  What do you want to think through?                        │
│                                                            │
│  ┌────────────────────────────────┐                        │
│  │ Map dependencies between nodes │                        │
│  └────────────────────────────────┘                        │
│  ┌──────────────────────────────────────┐                  │
│  │ Show logical gaps in my skill tree   │                  │
│  └──────────────────────────────────────┘                  │
│  ┌───────────────────────────────────────────────┐         │
│  │ What is the most efficient path to completion │         │
│  └───────────────────────────────────────────────┘         │
│  ┌──────────────────┐                                       │
│  │ Recap this week  │                                       │
│  └──────────────────┘                                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

An ENFP sees different chips: `"What can I connect this to?"`, `"Surprise me with a related concept"`, `"What would happen if I skipped ahead?"`, `"Make it more fun"`.

```css
.quick-prompt-chip {
  display: inline-flex;
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  background: var(--bg-primary);
  transition: border-color 100ms, background 100ms, color 100ms;
  margin: 0 6px 6px 0;
}

.quick-prompt-chip:hover {
  border-color: var(--border-strong);
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

The chips are generated per MBTI type — shipped as a static map in `mbtiQuickPrompts.js`.

---

### 19.3 Thinking State

When the AI is generating, no spinner. A single blinking cursor after the last assistant message, same as Claude.

```css
.ai-thinking-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: var(--text-muted);
  vertical-align: middle;
  margin-left: 2px;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
```

---

### 19.4 Feedback Tone Indicator (Subtle)

After a quiz result, the AI feedback message has a one-line context note explaining *why* the feedback sounds the way it does. Shown once per session, then hidden.

```
INTJ mode  ·  Direct feedback, no softening
──────────────────────────────────────────────
Your answer conflated container isolation with
VM-level isolation. The key distinction is...
```

```css
.feedback-mode-note {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-faint);
  letter-spacing: 0.04em;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
```

---

## 20. Notion AI Features — Inline AI in Notes Block

### 20.1 The `/` Slash Command Palette

Inside the Notes Block (Tiptap editor), typing `/` opens a mini command palette anchored to the cursor. This is the **only** time the palette appears — it's not a global shortcut inside Notes.

```
  ...your notes here

  /            ← cursor at start of new line
  ┌─────────────────────────────────────────┐
  │  /  Filter commands...                  │
  │─────────────────────────────────────────│
  │  AI                                     │
  │    ✦  Ask AI anything                  │
  │    ✦  Summarise this page              │
  │    ✦  Continue writing                 │
  │    ✦  Simplify for my learning style   │
  │  ──────────────────────────────────    │
  │  Blocks                                 │
  │    +  Quiz Block                        │
  │    +  Chart Block                       │
  │    +  Progress Block                    │
  │    +  Loop Component embed              │
  └─────────────────────────────────────────┘
```

```css
.slash-palette {
  position: absolute;
  width: 280px;
  background: var(--bg-primary);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 40;
}

.slash-palette-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.slash-palette-group-label {
  font-size: 10px;
  font-weight: var(--weight-semibold);
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 10px 14px 4px;
}

.slash-palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: background 80ms;
}

.slash-palette-item:hover,
.slash-palette-item.selected {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* AI items get a ✦ — the only special character we use */
.slash-ai-icon {
  font-size: 12px;
  color: var(--text-faint);
  flex-shrink: 0;
  width: 16px;
}
```

---

### 20.2 Text Selection → AI Tooltip

Select any text in the Notes Block → a minimal floating toolbar appears above the selection.

```
                     ┌──────────────────────────────────┐
                     │  Explain · Simplify · Ask AI  ✦  │
                     └──────────────────────────────────┘
selected text here...
```

```css
.selection-toolbar {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--text-primary);   /* Inverted — same as tooltip */
  border-radius: var(--radius-full);
  padding: 4px 6px;
  box-shadow: var(--shadow-md);
  z-index: 50;
  white-space: nowrap;
}

.selection-toolbar-btn {
  padding: 3px 8px;
  font-size: 11px;
  font-weight: var(--weight-medium);
  color: var(--bg-secondary);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background 80ms;
  background: transparent;
  border: none;
}

.selection-toolbar-btn:hover {
  background: var(--overlay);        /* Slight lightening on inverted bg */
  color: var(--bg-primary);
}

.selection-toolbar-divider {
  width: 1px;
  height: 14px;
  background: rgba(255,255,255,0.15);
  margin: 0 2px;
}
```

Clicking `Ask AI` opens the inline AI prompt field directly below the selected text:

```
selected text here...
──────────────────────────────────
✦  [What do you want to ask?  ↑ ]
──────────────────────────────────
```

The response is inserted as a new paragraph below the divider, in the same Notes font.

---

### 20.3 AI Insert Result

After AI generates text to insert, it appears in a `pending` state — the user must explicitly accept or discard.

```
Docker uses a layered filesystem...

┌─ ✦ AI suggestion ──────────────────────────────┐
│                                                 │
│  Each layer represents a Dockerfile instruction │
│  and is cached independently. This means only  │
│  changed layers are rebuilt, reducing image...  │
│                                                 │
│  [Insert]   [Discard]                           │
└─────────────────────────────────────────────────┘
```

```css
.ai-suggestion-block {
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin: 8px 0;
  background: var(--bg-secondary);
  position: relative;
}

.ai-suggestion-label {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-faint);
  margin-bottom: 8px;
  letter-spacing: 0.04em;
}

.ai-suggestion-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.ai-suggestion-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
```

`[Insert]` is `btn-primary`. `[Discard]` is `btn-ghost`. After insert, the block collapses into the flow of the Notes content with no visual remnant.

---

## 21. Microsoft Loop Features

### 21.1 Page Sidebar — Left of Canvas

The page sidebar (Part 1 §2 layout column) replaces the empty space left of the block grid. It is **inside** the main canvas area, not inside the app sidebar.

```
SIDEBAR (240px)   │  PAGE SIDEBAR (200px)  │  BLOCK CANVAS
                  │                        │
Docker Mastery ●  │   Pages                │  [block grid...]
React Hooks       │   ─────────────────    │
System Design     │   📄 Overview    ●     │
                  │   📄 Week 1            │
                  │     📄 Day 1           │
                  │   📄 Advanced          │
                  │   ─────────────────    │
                  │   + New Page           │
```

The page sidebar is toggleable — `]` shortcut, or collapse button at its top-right.

```css
.page-sidebar {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-tree-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: var(--text-sm);
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background 80ms, color 80ms;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-tree-item:hover  { background: var(--bg-hover);  color: var(--text-primary); }
.page-tree-item.active { background: var(--bg-active); color: var(--text-primary); }

/* Depth indentation */
.page-tree-item[data-depth="1"] { padding-left: 24px; }
.page-tree-item[data-depth="2"] { padding-left: 36px; }
```

---

### 21.2 Page Context Menu (Right-Click or `⋯` Icon)

Exactly mirroring Loop's context menu. The `⋯` icon appears on `hover` of any page tree item.

```
┌──────────────────────────────┐
│  📄 New subpage              │
│  ↗  Open                     │
│  🔗 Share page link          │
│  🔄 Share Loop component     │
│  ✏  Rename and style         │
│  ─────────────────────────   │
│  🔁 Recap                    │
│  ─────────────────────────   │
│  📋 Duplicate                │
│  📦 Add to workspace         │
│  💾 Save page as template    │
│  ─────────────────────────   │
│  🗑 Delete                   │
└──────────────────────────────┘
```

```css
/* Same contextual menu CSS as + menu from Part 1 §3 */
/* Width: 200px */
/* "Delete" row only: */
.context-menu-item.destructive {
  color: var(--text-muted);
}
.context-menu-item.destructive:hover {
  background: var(--bg-hover);
  color: var(--text-primary);   /* Still mono — no red */
}
```

---

### 21.3 Loop Component — Visual Language

A Loop Component embed inside a page looks exactly like a regular block, but has one distinguishing mark: a `⟳` sync indicator in the header.

```
┌────────────────────────────────────────────────────────────┐
│  DRAG ░░  Quiz — Node 3            ⟳  Synced 2s ago  [⋯]  │
│────────────────────────────────────────────────────────────│
│  [live quiz content]                                       │
└────────────────────────────────────────────────────────────┘
```

```css
.loop-sync-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-faint);
  margin-right: auto;      /* Pushes ⋯ to far right */
}

/* The ⟳ icon itself */
.loop-sync-icon {
  width: 10px;
  height: 10px;
  color: var(--text-faint);
  /* Animates briefly on sync, then stops */
  animation: none;
}

.loop-sync-icon.syncing {
  animation: spin 600ms linear;
}

@keyframes spin { to { transform: rotate(360deg); } }
```

**Share Loop Component** flow (from block `⋯` menu):

```
After clicking "🔄 Share as Loop Component":
┌──────────────────────────────────────────────────┐
│  Component created                               │
│                                                  │
│  pulse-learn.app/c/a8f3k2                        │
│  ─────────────────────────────────────────────   │
│  [Copy link]   [Embed in another page]           │
└──────────────────────────────────────────────────┘
```

This appears as a toast-sized card — not a modal. Dismisses in 6s or on click-outside.

---

### 21.4 Breadcrumb Navigation

When inside a subpage, a breadcrumb appears left of the workspace title.

```
Docker Mastery  /  Week 1  /  Day 1          [Recap] [Search] [Share] [⋯]
```

```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
}

.breadcrumb-item {
  color: var(--text-muted);
  cursor: pointer;
  transition: color 100ms;
}

.breadcrumb-item:hover { color: var(--text-primary); }

.breadcrumb-item.current {
  color: var(--text-primary);
  font-weight: var(--weight-medium);
  cursor: default;
}

.breadcrumb-separator {
  color: var(--text-faint);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  user-select: none;
}
```

---

### 21.5 Recap Block

When `Recap` is triggered (from the top bar or page context menu), the result inserts itself as a block at the top of the current page — not a modal, not a sidebar.

```
┌────────────────────────────────────────────────────────────┐
│  DRAG ░░  Recap — generated just now          [↺] [×]     │
│────────────────────────────────────────────────────────────│
│                                                            │
│  3 nodes completed since last session.                     │
│  Weakest area: Docker Networking (score avg 54%)           │
│                                                            │
│  Completed                                                 │
│  ─ Dockerfile Basics      ─ Docker Compose                 │
│  ─ Image Layers                                            │
│                                                            │
│  Suggested next steps                                      │
│  1. Revisit Docker Networking with a fresh quiz            │
│  2. Unlock Port Mapping (next locked node)                 │
│  3. Assign Docker Volumes to Sam for pair review           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```css
.recap-section-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 12px 0 6px;
}

.recap-item {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding: 3px 0;
  line-height: var(--leading-normal);
}

.recap-item::before {
  content: '—';
  margin-right: 8px;
  color: var(--text-faint);
  font-family: var(--font-mono);
}

.recap-step-number {
  font-family: var(--font-mono);
  color: var(--text-faint);
  font-size: var(--text-xs);
  margin-right: 8px;
}
```

`[↺]` in the header regenerates. `[×]` removes the block from the page.

---

## 22. Stellar Blockchain Credential

The Stellar credential moment is the rarest and most significant event in the product. It should feel like a quiet ceremony — not a confetti explosion.

### 22.1 Trigger Point

Completing a roadmap (100% nodes + passing final score) triggers this automatically. The canvas goes quiet — everything fades to 40% opacity except a centered card.

```css
.stellar-ceremony-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-primary);
  opacity: 0.88;
  z-index: 70;
}
```

### 22.2 Credential Modal

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                  Roadmap Complete                          │
│                                                            │
│            Docker Mastery                                  │
│            Completed by Anika Kapoor                       │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  STELLAR CREDENTIAL                                        │
│                                                            │
│  a8f3k2...d9e1c4                                           │
│  Anchored on Stellar Testnet · Block 52,847,193            │
│                                                            │
│  [View on Stellar Expert ↗]      [Copy TX hash]            │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  This credential is permanently verifiable.                │
│  No account required. No trusted third party.             │
│                                                            │
│  [Continue]                                                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```css
.stellar-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 440px;
  background: var(--bg-primary);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  padding: 40px;
  z-index: 80;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.stellar-title {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stellar-roadmap-name {
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.stellar-by {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: 4px;
}

.stellar-section-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-mono);
  margin-bottom: 8px;
}

.stellar-tx-hash {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background: var(--bg-tertiary);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  letter-spacing: 0.04em;
}

.stellar-block-info {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-faint);
  margin-top: 4px;
}

.stellar-disclaimer {
  font-size: var(--text-xs);
  color: var(--text-faint);
  line-height: var(--leading-relaxed);
  margin-top: 4px;
}
```

### 22.3 Credential in Profile / Sidebar

After anchoring, the roadmap entry in the sidebar gets a permanent indicator.

```
Docker Mastery   ✓
```

The `✓` is in `var(--text-muted)`, `font-family: var(--font-mono)`, `font-size: var(--text-xs)`. It does not grow, glow, or animate. It is just there, permanently.

Hovering shows a tooltip:

```
Credential anchored on Stellar
TX: a8f3k2...d9e1c4
```

### 22.4 Stellar Loading State

While the TX is being anchored (usually 3–5 seconds):

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                  Roadmap Complete                          │
│                                                            │
│            Docker Mastery                                  │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  Anchoring on Stellar...                                   │
│                                                            │
│  ●  ●  ●                                                   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```css
/* Three-dot pulse — no spinner */
.stellar-loading-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 16px;
}

.stellar-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--text-faint);
  animation: dot-pulse 1.4s ease-in-out infinite;
}

.stellar-dot:nth-child(2) { animation-delay: 0.2s; }
.stellar-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-pulse {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
  40%           { opacity: 1;    transform: scale(1);   }
}
```

---

## 23. Workspace Settings — Full Surface Map

Settings is a full-canvas page (no blocks). Accessed via `[⋯]` → `Workspace settings`.

```
←  Docker Mastery

                    Workspace Settings

  GENERAL
  ────────────────────────────────────────────────────────
  Title          [Docker Mastery                        ]
  Icon           [🐋  ∨]
  Time budget    [40 hours             ∨]

  PAGES
  ────────────────────────────────────────────────────────
  Manage pages, templates, and hierarchy →   [Open Pages]

  CONNECTIONS
  ────────────────────────────────────────────────────────
  📅 Google Calendar       Connected        [Manage]
  🐙 GitHub                Connected        [Manage]
  💬 Slack                 Not connected    [Connect]
  📝 Notion                Not connected    [Connect]
  🎨 Figma                 Not connected    [Connect]

  AUTOMATIONS
  ────────────────────────────────────────────────────────
  WHEN                       THEN                   [+ Rule]
  Node completed         →   Post to #learning   [⋯] [×]
  Quiz score < 60%       →   Create GitHub issue [⋯] [×]

  COLLABORATORS
  ────────────────────────────────────────────────────────
  AK  Anika Kapoor          Owner
  SR  Sam Rowan             Editor          [Remove]
  ─────────────────────────────────────────────────────
  [Invite collaborator...]

  CREDENTIAL
  ────────────────────────────────────────────────────────
  Stellar TX   a8f3k2...d9e1c4    [View ↗]   [Copy]
  Status       Anchored · Block 52,847,193

  DANGER
  ────────────────────────────────────────────────────────
  [Delete this roadmap]
```

The `[Delete this roadmap]` button is `btn-ghost` with `color: var(--text-muted)`. Clicking it renders inline confirmation:

```
  Delete "Docker Mastery"? This cannot be undone.
  [Confirm delete]   [Cancel]
```

No modal. No red. `[Confirm delete]` is `btn-primary` (inverted monochrome). The weight of the action is communicated by the words, not the color.

---

## 24. Responsive Behaviour

Since the workspace canvas, page sidebar, and AI sidebar can all be open simultaneously, we need a clear collapse priority.

| Viewport | What collapses first | What collapses second |
|---|---|---|
| < 1400px | AI sidebar closes automatically | — |
| < 1100px | Page sidebar closes automatically | — |
| < 900px  | App sidebar collapses | — |
| < 768px  | Block grid goes single-column vertical stack | All sidebars hidden behind hamburger |

```css
/* Below 768px: disable drag/resize, stack blocks vertically */
@media (max-width: 768px) {
  .react-grid-layout {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .react-resizable-handle { display: none; }
  .drag-handle { cursor: default; }
}
```

---

## 25. Updated Copilot Cheatsheet — Part 2 Components

| Component | Copilot Trigger Comment |
|---|---|
| `PresenceBar.jsx` | `// Overlapping 24px avatar stack with online dot indicator. Overflow count (+N). Tooltip on hover shows name and current page. Monochrome — no color-coding users.` |
| `CollabCursor.jsx` | `// Absolute-positioned other-user cursor: 1px vertical line with name tag pill below. Position updates via Supabase Realtime. No color — mono only.` |
| `CollaboratorPanel.jsx` | `// 300px right slide-in panel. Section: active users with location in mono font. Section: invite by email with role select dropdown. Divider between sections.` |
| `NodeCommentThread.jsx` | `// Inline comment thread that expands below a node row. Left border 1px. Each comment: mono author label, text, time right-aligned. Reply input at bottom.` |
| `ConnectionsPanel.jsx` | `// 300px right panel. Two sections: Connected (with Manage button) and Available (with Connect button). Each service is a bordered card with icon, name, status, subtitle.` |
| `AutomationRow.jsx` | `// Single automation rule row: WHEN text flex-1, mono arrow, THEN text flex-1, ghost ⋯ button, ghost × button. Inline new-row form uses two minimal select dropdowns.` |
| `SlashCommandPalette.jsx` | `// Tiptap slash command palette. 280px card anchored at cursor. Filter input at top. Groups: AI items (✦ icon) and Block items (+). Arrow key navigation, Enter to select, Escape to close.` |
| `SelectionToolbar.jsx` | `// Floating toolbar above text selection. Inverted bg (text-primary). Pill-shaped. Buttons: Explain, Simplify, Ask AI. Thin divider between. Opens inline AI prompt field on Ask AI click.` |
| `AISuggestionBlock.jsx` | `// Pending AI insertion block. Secondary bg, border. Mono label "AI suggestion". Generated text in sm secondary. Insert (primary) and Discard (ghost) buttons. Collapses into flow on Insert.` |
| `PageSidebar.jsx` | `// 200px inner page sidebar. Collapsible with ] key. Tree items with indent per depth level. ⋯ icon appears on hover → context menu with New subpage, Open, Share page link, Share Loop component, Rename and style, Recap, Duplicate, Add to workspace, Save as template, Delete.` |
| `LoopComponentBlock.jsx` | `// Block with ⟳ sync indicator in header. Sync icon animates briefly on update then stops. Mono "Synced Xs ago" label. Underlying block renders normally inside content area.` |
| `LoopShareCard.jsx` | `// Toast-sized (not modal) share confirmation card. Shows short URL. Copy link ghost button. Embed in another page ghost button. Auto-dismisses in 6s.` |
| `RecapBlock.jsx` | `// Block with regenerate ↺ and × in header. Sections with uppercase mono labels: headline, completed list (— prefix), weak areas, suggested next steps (numbered). btn-ghost for regenerate.` |
| `StellarModal.jsx` | `// Centered fixed modal. Overlay is bg-primary at 88% opacity. Loading state: three-dot pulse animation in text-faint. Success state: TX hash in mono bg-tertiary pill, block number, two ghost action buttons, disclaimer text.` |
| `WorkspaceSettings.jsx` | `// Full-canvas settings page (no blocks). Back arrow returns to canvas. Sections: General, Pages, Connections (connection cards), Automations (rule rows), Collaborators, Credential (mono TX hash), Danger. All inline — no sub-modals.` |
| `MBTIQuickPrompts.jsx` | `// Empty AI sidebar state. Static map of 4 chips per MBTI type. Chip: border, rounded-md, sm text-secondary, hover border-strong bg-hover text-primary. Renders from mbtiQuickPrompts.js map.` |

---

*UI Design Specification Part 2 — Pulse-Learn v4*
*Monotone · Minimal · No new layout rules introduced*
*Collaboration · MCP · MBTI AI · Loop Components · Notion AI · Stellar*
