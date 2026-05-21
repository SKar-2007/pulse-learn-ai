# Pulse-Learn — UI Design Specification
## Claude-Inspired Minimal Monotone Interface

> **Design Philosophy:** One surface. No noise. Everything is one keystroke or one click away — hidden until needed, never cluttering the canvas.

---

## 0. Design Tokens

### Color System (CSS Variables)

```css
/* ── Light Mode ─────────────────────────────────────────────── */
:root {
  --bg-primary:    #ffffff;
  --bg-secondary:  #f9f9f8;
  --bg-tertiary:   #f0efed;
  --bg-hover:      #ebebea;
  --bg-active:     #e3e2df;

  --text-primary:  #1a1a19;
  --text-secondary:#4a4a47;
  --text-muted:    #8a8a85;
  --text-faint:    #b5b5b0;

  --border:        #e5e5e3;
  --border-strong: #d0d0cc;

  --accent:        #1a1a19;       /* Same as text — no color accent */
  --accent-subtle: #f0efed;

  --overlay:       rgba(0,0,0,0.04);
  --shadow-sm:     0 1px 3px rgba(0,0,0,0.06);
  --shadow-md:     0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg:     0 12px 40px rgba(0,0,0,0.10);
}

/* ── Dark Mode ──────────────────────────────────────────────── */
[data-theme="dark"] {
  --bg-primary:    #1a1a19;
  --bg-secondary:  #212120;
  --bg-tertiary:   #2a2a28;
  --bg-hover:      #313130;
  --bg-active:     #3a3a38;

  --text-primary:  #f0efed;
  --text-secondary:#c8c8c3;
  --text-muted:    #8a8a85;
  --text-faint:    #555550;

  --border:        #2e2e2c;
  --border-strong: #3d3d3a;

  --accent:        #f0efed;
  --accent-subtle: #2a2a28;

  --overlay:       rgba(255,255,255,0.04);
  --shadow-sm:     0 1px 3px rgba(0,0,0,0.3);
  --shadow-md:     0 4px 16px rgba(0,0,0,0.4);
  --shadow-lg:     0 12px 40px rgba(0,0,0,0.5);
}
```

### Typography

```css
/* Use: Geist (Vercel's font) or fallback to system mono + system sans */

--font-sans:  "Geist", "Inter", ui-sans-serif, system-ui, sans-serif;
--font-mono:  "Geist Mono", "Fira Code", ui-monospace, monospace;

--text-xs:    0.70rem;   /* 11.2px — labels, timestamps, badges */
--text-sm:    0.813rem;  /* 13px   — sidebar items, metadata */
--text-base:  0.875rem;  /* 14px   — body, messages */
--text-md:    1rem;      /* 16px   — input, primary content */
--text-lg:    1.125rem;  /* 18px   — section titles */
--text-xl:    1.5rem;    /* 24px   — page headings */
--text-2xl:   2rem;      /* 32px   — hero text */

--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;

--leading-tight:  1.3;
--leading-normal: 1.6;
--leading-relaxed: 1.75;
```

### Spacing & Radius

```css
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;

--radius-sm:  6px;
--radius-md:  10px;
--radius-lg:  14px;
--radius-xl:  20px;
--radius-full: 9999px;
```

---

## 1. Global Layout

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px, collapsible)  │  MAIN CANVAS               │
│                                │                             │
│  [logo]          [theme] [new] │  [top bar: minimal]         │
│  ─────────────────────────     │                             │
│  Search...             ⌘K      │                             │
│  ─────────────────────────     │                             │
│  Roadmaps                      │         CONTENT AREA        │
│    › Docker Mastery            │                             │
│    › React Fundamentals        │                             │
│    › System Design             │                             │
│  ─────────────────────────     │                             │
│  [+ New Roadmap]               │                             │
│                                │                             │
│  ─────────────────────────     │                             │
│  [user avatar]  [settings]     │                             │
└────────────────────────────────┴─────────────────────────────┘
```

### Sidebar Rules
- **Width:** 240px expanded, 0px (hidden, slide out) collapsed
- **Toggle:** `[` key shortcut, or click the left edge drag zone
- **No icons-only mode** — Claude doesn't do it, neither do we
- Background: `var(--bg-secondary)` — 1 tone off from main
- Right border: `1px solid var(--border)`
- No heavy shadows between sidebar and main

---

## 2. Landing / New Session Screen

The first thing a user sees after login — before any roadmap is selected.

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                                                              │
│                    Pulse-Learn                               │
│                                                              │
│          What do you want to learn today?                    │
│                                                              │
│   ┌────────────────────────────────────────────────┐        │
│   │  Upload a syllabus, paste a topic, or ask...   │        │
│   │                                               ↑ │        │
│   └────────────────────────────────────────────────┘        │
│                                                              │
│   ── or start from ──────────────────────────────────       │
│                                                              │
│   [Docker Mastery]  [React Hooks]  [System Design]          │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Input Bar — The Only Hero Element

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  📎   Type a topic, paste a syllabus, or drop a PDF...    [↑] │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

- **Border:** `1px solid var(--border-strong)` — slightly more visible than page border
- **Radius:** `var(--radius-xl)` — pill-like, just like Claude
- **Background:** `var(--bg-primary)`
- **Shadow:** `var(--shadow-md)` — lifts it subtly
- **On focus:** border becomes `var(--text-muted)`, shadow deepens slightly
- **Send button [↑]:** monochrome circle, `var(--bg-active)` background, arrow icon
- **Paperclip [📎]:** leftmost, opens file picker (PDF, DOCX, TXT)
- **No placeholder animation, no gradient borders** — just clean

### Suggestion Pills (below input)

```css
.suggestion-pill {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}

.suggestion-pill:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
  color: var(--text-primary);
}
```

---

## 3. The `+` Button — Everything Behind One Button

Claude's `+` opens a tiny menu with attach options. Pulse-Learn's `+` opens a **command palette** with everything.

```
Input Bar:
┌────────────────────────────────────────────────────────────┐
│  [+]   Start typing or upload a document...           [↑]  │
└────────────────────────────────────────────────────────────┘
     ↓ click [+]

┌─────────────────────────────────────┐
│  📎  Upload PDF / DOCX / TXT        │
│  🔗  Paste a URL (scrape content)   │
│  📋  Paste raw syllabus text        │
│  ─────────────────────────────────  │
│  🧩  Add block to workspace         │
│  🤖  Open AI Assistant              │
│  📅  Import from Google Calendar    │
│  🐙  Link GitHub issue              │
└─────────────────────────────────────┘
```

### `+` Menu Design Rules
- Appears as a **floating card** above the input bar, anchored to the `+` button
- Width: `220px`, no wider
- Background: `var(--bg-primary)`
- Border: `1px solid var(--border-strong)`
- Shadow: `var(--shadow-lg)`
- Radius: `var(--radius-lg)`
- Each row: `36px tall`, `12px horizontal padding`, icon + label
- Icon: 16px, `var(--text-muted)` — NOT colored
- Divider: `1px solid var(--border)` between sections
- Hover: `background: var(--bg-hover)`, entire row highlights
- Dismiss: click outside or `Escape`

---

## 4. Roadmap Workspace View

After a roadmap is generated, this is the main experience.

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                │  MAIN WORKSPACE                        │
│                        │                                        │
│ Docker Mastery  ●      │  Docker Mastery          [+ Block] [⋯] │
│ ─────────────────      │  ──────────────────────────────────    │
│  Pages                 │                                        │
│   📄 Overview    ●     │  ┌──────────────┐  ┌──────────────┐   │
│   📄 Week 1            │  │  Skill Tree  │  │  Progress    │   │
│     📄 Day 1           │  │              │  │    87%  ●    │   │
│   📄 Advanced          │  │  Node 1 ✓    │  └──────────────┘   │
│                        │  │  Node 2 ✓    │                      │
│ ─────────────────      │  │  Node 3 ⚡   │  ┌──────────────┐   │
│ [+ New Page]           │  │  Node 4 🔒   │  │  MBTI        │   │
│                        │  └──────────────┘  │  INTJ ●      │   │
│                        │                    └──────────────┘   │
│                        │  Type / to add a block...             │
└────────────────────────┴────────────────────────────────────────┘
```

### Top Bar of Workspace
```
Docker Mastery                              [Recap] [Search] [Share] [⋯]
```

- Title: `var(--text-primary)`, `font-size: var(--text-md)`, `font-weight: var(--weight-semibold)`
- Right actions: text buttons, no icon-only, no filled backgrounds
- `[⋯]` opens workspace settings (MCP, automations, templates, danger zone)
- No colored header bar, no gradient — same `var(--bg-primary)` as the canvas

---

## 5. Block Design Language

Every block follows the same visual grammar. No block should look like a "card from a different app."

### Block Anatomy

```
┌────────────────────────────────────────────────────┐
│  DRAG ░░  Skill Tree                          [⋯]  │  ← header (32px)
│────────────────────────────────────────────────────│  ← 1px border
│                                                    │
│  [block content here]                              │  ← content area
│                                                    │
└────────────────────────────────────────────────────┘
```

```css
.block {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.block-header {
  height: 32px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  cursor: move;   /* drag handle is the entire header */
}

.block-header-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-muted);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  flex: 1;
}

.block-menu-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-faint);
  cursor: pointer;
  transition: background 100ms, color 100ms;
}

.block-menu-btn:hover {
  background: var(--bg-active);
  color: var(--text-primary);
}
```

### Block Context Menu (`[⋯]`)

```
┌────────────────────────────┐
│  🔗  Share as Loop Comp    │
│  📋  Duplicate             │
│  ─────────────────────     │
│  🗑  Remove from page      │
└────────────────────────────┘
```

Same visual rules as the `+` menu above.

---

## 6. Node States in Skill Tree Block

Nodes use **no color coding** beyond subtle grayscale shifts. The only "color" is the check mark on completion — and even that is monochrome.

```
● Node 1 — Introduction to Docker         ✓  [32m]
● Node 2 — Containers vs VMs              ✓  [45m]
⚡ Node 3 — Dockerfile Basics             ▶  [60m]  ← active
○ Node 4 — Docker Compose                 🔒 [90m]  ← locked
○ Node 5 — Networking Fundamentals        🔒 [75m]
```

```css
.node-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 100ms;
}

.node-row:hover           { background: var(--bg-hover); }
.node-row.active          { background: var(--bg-active); }
.node-row.locked          { opacity: 0.45; cursor: default; }
.node-row.completed       { color: var(--text-muted); }

.node-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.node-indicator.completed { background: var(--text-primary); }
.node-indicator.active    { background: var(--text-primary); box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 3px var(--text-primary); }
.node-indicator.locked    { border: 1.5px solid var(--border-strong); background: transparent; }
```

---

## 7. Global Search (⌘K)

Full-screen overlay, same pattern as Linear / Vercel / Claude's command palette.

```
┌────────────────────────────────────────────────────────────┐
│  [dim backdrop, full screen]                                │
│                                                            │
│       ┌───────────────────────────────────────────┐        │
│       │  🔍  Search everything...          [Esc]  │        │
│       └───────────────────────────────────────────┘        │
│       ┌───────────────────────────────────────────┐        │
│       │  Pages                                    │        │
│       │    📄  Overview — Docker Mastery          │        │
│       │    📄  Week 1 — React Hooks               │        │
│       │  ──────────────────────────────────────   │        │
│       │  Nodes                                    │        │
│       │    ●   Docker Networking Fundamentals     │        │
│       │    ●   useState Deep Dive                 │        │
│       └───────────────────────────────────────────┘        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```css
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 100;
}

.search-modal {
  width: 560px;
  background: var(--bg-primary);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.search-input-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 10px;
  border-bottom: 1px solid var(--border);
}

.search-input {
  flex: 1;
  font-size: var(--text-md);
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  caret-color: var(--text-primary);
}

.search-result-group-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 12px 16px 4px;
}

.search-result-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: background 80ms;
}

.search-result-row:hover,
.search-result-row.selected {
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

---

## 8. AI Assistant Sidebar

Slides in from the right — same width as Claude's sidebar. Does not replace the main canvas.

```
MAIN CANVAS (narrowed)    │  AI ASSISTANT (300px)
                           │
                           │  AI Assistant        [×]
                           │  ─────────────────────
                           │
                           │  [Chat messages here]
                           │  You: Summarize Node 3
                           │  AI: Node 3 covers...
                           │
                           │  ─────────────────────
                           │  [Ask anything...]  [↑]
```

```css
.ai-sidebar {
  width: 300px;
  height: 100%;
  border-left: 1px solid var(--border);
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.ai-sidebar-header {
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
}

.ai-message {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  max-width: 85%;
}

.ai-message.user {
  background: var(--bg-active);
  color: var(--text-primary);
  align-self: flex-end;
}

.ai-message.assistant {
  background: transparent;
  color: var(--text-secondary);
  align-self: flex-start;
  /* No background — same as Claude's assistant messages */
}
```

---

## 9. MBTI Test Screen

Same rhythm as Claude's new conversation — centered, breathing space, no sidebar.

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ──────────────────────────────────────────  ← progress   │
│  Question 4 of 20                    20%                   │
│                                                            │
│                                                            │
│  INFORMATION PROCESSING                ← dimension label  │
│                                                            │
│  When learning a new concept,                              │
│  you want to start with:                                   │
│                                                            │
│  ┌───────────────────────────────────────────────────┐     │
│  │  A.  The big picture — how it fits the field      │     │
│  └───────────────────────────────────────────────────┘     │
│                                                            │
│  ┌───────────────────────────────────────────────────┐     │
│  │  B.  The specific facts and step-by-step details  │     │
│  └───────────────────────────────────────────────────┘     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```css
.mbti-option {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  text-align: left;
  font-size: var(--text-base);
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 120ms, background 120ms, color 120ms;
}

.mbti-option:hover {
  border-color: var(--border-strong);
  background: var(--bg-hover);
  color: var(--text-primary);
}

.mbti-option:active {
  background: var(--bg-active);
}

/* No selected state with color — just a momentary active press, then advances */

.mbti-progress-bar {
  height: 2px;                          /* Thin — Claude thin */
  background: var(--bg-active);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.mbti-progress-fill {
  height: 100%;
  background: var(--text-primary);      /* Monochrome fill */
  transition: width 300ms ease;
}

.mbti-dimension-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-mono);
}
```

### Result Screen

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                        INTJ                                │
│                   The Architect                            │
│                                                            │
│  Systems thinker. Values efficiency, strategic             │
│  depth, and logical coherence.                             │
│                                                            │
│  E ─────────────────────●───── I                          │
│  N ─────────────●───────────── S                          │
│  T ──────────────────────────● F                          │
│  J ●───────────────────────── P                           │
│                                                            │
│  Pulse-Learn will now calibrate every quiz, lesson,        │
│  and piece of feedback to how you think.                   │
│                                                            │
│  [  Build My Learning Engine  ]   ← only CTA              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```css
.mbti-type-display {
  font-size: var(--text-2xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  font-family: var(--font-mono);
  letter-spacing: 0.12em;
}

.mbti-type-name {
  font-size: var(--text-base);
  color: var(--text-muted);
  font-weight: var(--weight-normal);
}

.dimension-track {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-faint);
}

.dimension-bar {
  flex: 1;
  height: 1px;
  background: var(--border-strong);
  position: relative;
}

.dimension-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-primary);
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}
```

---

## 10. Buttons

There are only 3 button variants. Zero filled colored buttons anywhere.

```css
/* ── Primary (ghost + border) ───────────────── */
.btn-primary {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--text-primary);
  background: var(--text-primary);
  color: var(--bg-primary);             /* Inverted — dark bg, light text */
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: opacity 120ms;
}
.btn-primary:hover { opacity: 0.85; }

/* ── Secondary (ghost) ──────────────────────── */
.btn-secondary {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background 120ms, color 120ms;
}
.btn-secondary:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* ── Ghost (no border) ──────────────────────── */
.btn-ghost {
  padding: 6px 10px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background 100ms, color 100ms;
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

---

## 11. Light / Dark Mode Toggle

No toggle switch UI. Just a single icon button in the sidebar header — click to flip.

```
[☀]  →  switches to light
[◑]  →  switches to dark
```

```css
.theme-toggle {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 100ms, color 100ms;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

Implementation:

```javascript
// Toggle theme
const toggle = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
};

// Init on load
const saved = localStorage.getItem('theme')
  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', saved);
```

---

## 12. Quiz Inline Experience

Quiz lives inside the Quiz Block on the workspace canvas, or can open as a focused modal.

```
┌───────────────────────────────────────────────────────────────┐
│  QUIZ  Dockerfile Basics                              [×]     │
│────────────────────────────────────────────────────────────── │
│                                                               │
│  Question 2 of 3                                              │
│                                                               │
│  What instruction sets the base image in a Dockerfile?        │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Your answer...                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│                                           [Submit Answer →]   │
└───────────────────────────────────────────────────────────────┘
```

### Feedback State (after submit)

```
┌───────────────────────────────────────────────────────────────┐
│  — Correct ─────────────────────────────────────────────      │
│                                                               │
│  FROM instruction sets the base image. Your answer            │
│  correctly identified this along with its purpose in          │
│  establishing the layer context.                              │
│                                                               │
│                                           [Next Question →]   │
└───────────────────────────────────────────────────────────────┘
```

- **Correct:** Just a thin `var(--text-primary)` left border on the feedback section. No green.
- **Incorrect:** Thin `var(--border-strong)` left border, softer. No red.
- **Score:** `2 / 3 correct` in `var(--text-muted)` — no badge, no confetti for partial.
- **100% pass:** A single line: `Passed. Node unlocked.` + the skill tree updates.

---

## 13. Progress Block — Minimal Ring

```css
/* SVG ring — same as v3 code, just with monotone colors */
stroke: var(--text-primary);      /* progress arc */
stroke (bg): var(--bg-active);    /* track */
text fill: var(--text-primary);   /* percentage */
```

No glow, no gradient on the ring. The ring IS the data.

---

## 14. Notification / Toast

Appears at bottom-center, auto-dismisses in 3s.

```
                  ┌─────────────────────────────────┐
                  │  ✓  Node unlocked: Docker Compose │
                  └─────────────────────────────────┘
```

```css
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 18px;
  background: var(--text-primary);
  color: var(--bg-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  box-shadow: var(--shadow-lg);
  animation: toast-in 200ms ease, toast-out 200ms ease 2.8s forwards;
  white-space: nowrap;
}

@keyframes toast-in  { from { opacity: 0; transform: translateX(-50%) translateY(8px); } }
@keyframes toast-out { to   { opacity: 0; transform: translateX(-50%) translateY(8px); } }
```

No error toasts in red. Error is inline, near where it happened.

---

## 15. Copilot Prompt Cheatsheet — UI Components

| Component | Copilot Trigger Comment |
|---|---|
| `InputBar.jsx` | `// Pill-shaped input bar with paperclip attachment button left, submit arrow button right. Monochrome, no color accents. Expands height on multiline.` |
| `PlusMenu.jsx` | `// Floating card menu anchored to + button. 220px wide. Sections with 1px divider. Each row: 16px icon in text-muted, text label. Hover highlights full row.` |
| `Sidebar.jsx` | `// 240px collapsible left sidebar with logo, theme toggle, new button, search shortcut, roadmap list, new roadmap button, and user avatar at bottom. Slide animation on toggle.` |
| `BlockHeader.jsx` | `// 32px block header bar with drag handle dots left, uppercase mono label center, context menu ⋯ right. Secondary background, bottom border.` |
| `GlobalSearch.jsx` | `// Cmd+K modal. Full-screen blur overlay. 560px centered modal. Search input with magnifier icon. Results grouped by Pages/Nodes/Notes with tiny uppercase group labels. Arrow key navigation.` |
| `ThemeToggle.jsx` | `// 28px square ghost button that toggles data-theme between dark and light on html element. Persists to localStorage. Respects prefers-color-scheme on first load.` |
| `MBTIOption.jsx` | `// Full-width option button with A/B label in font-mono text-muted, option text in text-secondary. Border shows on hover. No selected state — advances immediately on click.` |
| `Toast.jsx` | `// Bottom-center fixed toast. Pill-shaped. Inverted colors (bg=text-primary, text=bg-primary). Auto-dismisses after 3 seconds with slide-up entry and slide-down exit animation.` |
| `NodeRow.jsx` | `// Flex row for skill tree node. 8px circle indicator left (filled=complete, pulse=active, outlined=locked). Title. Status icon right. Locked rows at 45% opacity.` |
| `AIAssistantSidebar.jsx` | `// 300px right panel. Top bar with title and close X. Scrollable message area. User messages in bg-active pill right-aligned. Assistant messages plain left-aligned no background. Input bar at bottom.` |

---

## 16. What We Do NOT Use

| ❌ Avoid | ✅ Use Instead |
|---|---|
| Purple / indigo accent colors | `var(--text-primary)` — monochrome |
| Colored filled buttons | Ghost + border buttons only |
| Icon-only sidebar (collapsed to icons) | Full collapse — 0px, no icon rail |
| Loading spinners | Skeleton placeholders or `opacity: 0.5` on stale content |
| Modal overlays for everything | Slide-in panels, inline states |
| Color-coded status (green/red/yellow) | Opacity, weight, and position encode status |
| Multiple font families | One sans (`Geist`), one mono (`Geist Mono`) |
| Box shadows everywhere | Borders do the work; shadows only on floating elements |
| Gradient borders / glow effects | 1px solid border, no glow |
| Confetti / celebration animations | Single-line text: "Passed. Node unlocked." |
| Charts with colored data series | Single-series only; monochrome axis + bars/line |

---

*UI Design Specification — Pulse-Learn v4*
*Monotone · Minimal · Dark/Light · Claude-inspired*
