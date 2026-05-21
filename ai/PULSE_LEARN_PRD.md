# Product Requirement Document (PRD)
## Pulse-Learn AI — Agentic AI Learning Engine with Stellar-Backed Proof of Knowledge

**Version:** 1.0  
**Status:** Ready for Development  
**Primary IDE:** VSCode with GitHub Copilot  
**Target Completion:** Hackathon Sprint (~24 Hours)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack & Dependency Setup](#2-tech-stack--dependency-setup)
3. [Repository & Folder Structure](#3-repository--folder-structure)
4. [Database Setup (Supabase)](#4-database-setup-supabase)
5. [Backend — Step-by-Step Build](#5-backend--step-by-step-build)
6. [AI Layer — Prompt Engineering Contracts](#6-ai-layer--prompt-engineering-contracts)
7. [Stellar Blockchain Module](#7-stellar-blockchain-module)
8. [Frontend — Step-by-Step Build](#8-frontend--step-by-step-build)
9. [API Contract Reference](#9-api-contract-reference)
10. [Edge Cases & Mitigations](#10-edge-cases--mitigations)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [Deployment Checklist](#12-deployment-checklist)
13. [GitHub Copilot Prompt Cheatsheet](#13-github-copilot-prompt-cheatsheet)

---

## 1. Executive Summary

Pulse-Learn AI converts any uploaded syllabus or PDF into a personalized, time-boxed **Skill Tree** of learning nodes. An AI agent drives the entire experience: it generates the roadmap, quizzes the user on each concept, scores recall performance, and mutates the learning path in real-time by inserting remediation nodes when the user fails. Upon completing a full track, the platform anchors a tamper-proof credential receipt on the **Stellar Testnet** blockchain.

### What Makes This Architecturally Different From a Chatbot

| Standard AI Chatbot | Pulse-Learn AI |
|---|---|
| Stateless single-turn Q&A | Stateful multi-step agentic workflow |
| Flat response | Tree-structured, database-persisted roadmap |
| No adaptation | Path mutates on quiz failure |
| No verifiable output | Immutable Stellar transaction hash as credential |

---

## 2. Tech Stack & Dependency Setup

### Step 1 — Initialize the Monorepo

```bash
mkdir pulse-learn && cd pulse-learn
mkdir client server
```

### Step 2 — Backend Dependencies

```bash
cd server
npm init -y
npm install express cors multer dotenv @supabase/supabase-js @google/generative-ai @stellar/stellar-sdk pdf-parse uuid
npm install --save-dev nodemon
```

> **GitHub Copilot Tip:** After `npm install`, open `server/index.js` and type the comment  
> `// Express server with cors, multer for file uploads, supabase client, and dotenv config`  
> Copilot will scaffold the full boilerplate.

### Step 3 — Frontend Dependencies

```bash
cd ../client
npm create vite@latest . -- --template react
npm install
npm install tailwindcss @tailwindcss/vite lucide-react framer-motion @supabase/supabase-js axios
npx tailwindcss init -p
```

### Step 4 — Tailwind Config

In `client/tailwind.config.js`, replace content with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #6366f1' },
          '50%': { boxShadow: '0 0 20px #6366f1, 0 0 40px #6366f1' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## 3. Repository & Folder Structure

Use this exact structure. GitHub Copilot works best when file names and folders are semantically clear.

```
pulse-learn/
├── client/                         # React Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SkillTree.jsx       # SVG-connected node canvas
│   │   │   ├── NodeCard.jsx        # Individual node UI card
│   │   │   ├── QuizPanel.jsx       # Active recall quiz interface
│   │   │   ├── StellarModal.jsx    # Completion + TX hash modal
│   │   │   └── UploadForm.jsx      # Syllabus upload + hours input
│   │   ├── hooks/
│   │   │   ├── useRoadmap.js       # Roadmap fetch/state logic
│   │   │   └── useQuiz.js          # Quiz submission logic
│   │   ├── lib/
│   │   │   └── supabaseClient.js   # Supabase client singleton
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env
│
├── server/                         # Node.js Express Backend
│   ├── routes/
│   │   ├── roadmap.js              # POST /api/roadmap/generate
│   │   └── node.js                 # POST /api/node/verify
│   ├── services/
│   │   ├── geminiService.js        # All Gemini API calls
│   │   ├── supabaseService.js      # All DB read/write operations
│   │   └── stellarService.js       # Stellar SDK mint function
│   ├── middleware/
│   │   └── upload.js               # Multer config (15MB PDF limit)
│   ├── index.js                    # App entry point
│   └── .env
│
└── README.md
```

---

## 4. Database Setup (Supabase)

### Step 1 — Create a Supabase Project

Go to [supabase.com](https://supabase.com), create a new project, and note down:
- `Project URL`
- `anon/public API key`
- `service_role key` (for backend only)

### Step 2 — Run This SQL in the Supabase SQL Editor

Copy and paste the entire block at once:

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (synced with Supabase Auth)
CREATE TABLE users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROADMAPS (One per uploaded syllabus)
CREATE TABLE roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time_budget_hours INT NOT NULL,
    target_date DATE,
    stellar_tx_hash TEXT,           -- Populated after Stellar mint
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NODES (Tree structure via self-referencing parent_node_id)
CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    parent_node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    estimated_minutes INT NOT NULL,
    sequence_order INT NOT NULL,
    status TEXT DEFAULT 'locked',   -- 'locked' | 'unlocked' | 'completed'
    remediation_depth INT DEFAULT 0 -- Tracks depth to cap infinite loops at 2
);

-- ACTIVE RECALL LOGS (One record per quiz attempt)
CREATE TABLE active_recall_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    quiz_score DECIMAL(5,2),
    ai_feedback TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 3 — Enable Row Level Security (RLS) Policies

```sql
-- Users can only read/write their own roadmaps
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own roadmaps" ON roadmaps
  FOR ALL USING (auth.uid() = user_id);

-- Same for nodes
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own nodes" ON nodes
  FOR ALL USING (
    roadmap_id IN (SELECT id FROM roadmaps WHERE user_id = auth.uid())
  );

-- Same for logs
ALTER TABLE active_recall_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own logs" ON active_recall_logs
  FOR ALL USING (auth.uid() = user_id);
```

---

## 5. Backend — Step-by-Step Build

### Step 1 — Entry Point (`server/index.js`)

```javascript
// Express server with CORS, JSON parsing, Multer upload routes, and dotenv config
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import roadmapRouter from './routes/roadmap.js';
import nodeRouter from './routes/node.js';

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/roadmap', roadmapRouter);
app.use('/api/node', nodeRouter);

app.listen(3001, () => console.log('Pulse-Learn server running on port 3001'));
```

> **GitHub Copilot Tip:** The comment on line 1 is enough for Copilot to auto-complete this entire file. Keep comments semantic and imperative.

### Step 2 — Multer Middleware (`server/middleware/upload.js`)

```javascript
// Multer middleware: accept only PDF and TXT files, hard cap at 15MB
import multer from 'multer';

const storage = multer.memoryStorage(); // Store in buffer, not disk

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'text/plain'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and TXT files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB hard cap
  fileFilter,
});

export default upload;
```

### Step 3 — Supabase Service (`server/services/supabaseService.js`)

```javascript
// Supabase service: insert roadmap, bulk insert nodes, update node status, save stellar hash
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service_role for server-side
);

export async function createRoadmap({ userId, title, timeBudgetHours, targetDate }) {
  const { data, error } = await supabase
    .from('roadmaps')
    .insert({ user_id: userId, title, time_budget_hours: timeBudgetHours, target_date: targetDate })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertNodes(roadmapId, nodesArray) {
  const rows = nodesArray.map((n) => ({
    roadmap_id: roadmapId,
    title: n.title,
    summary: n.summary,
    estimated_minutes: n.estimated_minutes,
    sequence_order: n.sequence_order,
    status: n.sequence_order === 1 ? 'unlocked' : 'locked', // First node unlocked
    remediation_depth: 0,
  }));
  const { data, error } = await supabase.from('nodes').insert(rows).select();
  if (error) throw error;
  return data;
}

export async function markNodeCompleted(nodeId) {
  const { error } = await supabase
    .from('nodes')
    .update({ status: 'completed' })
    .eq('id', nodeId);
  if (error) throw error;
}

export async function unlockNextNode(roadmapId, completedOrder) {
  const { error } = await supabase
    .from('nodes')
    .update({ status: 'unlocked' })
    .eq('roadmap_id', roadmapId)
    .eq('sequence_order', completedOrder + 1);
  if (error) throw error;
}

export async function insertRemediationNode(parentNodeId, roadmapId, nodeData, parentDepth) {
  const { data, error } = await supabase
    .from('nodes')
    .insert({
      roadmap_id: roadmapId,
      parent_node_id: parentNodeId,
      title: nodeData.title,
      summary: nodeData.summary,
      estimated_minutes: nodeData.estimated_minutes,
      sequence_order: 9999, // Remediation nodes are injected out-of-band
      status: 'unlocked',
      remediation_depth: parentDepth + 1,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveStellarHash(roadmapId, txHash) {
  const { error } = await supabase
    .from('roadmaps')
    .update({ stellar_tx_hash: txHash })
    .eq('id', roadmapId);
  if (error) throw error;
}

export async function getRoadmapWithNodes(roadmapId) {
  const { data: roadmap, error: rErr } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('id', roadmapId)
    .single();
  if (rErr) throw rErr;

  const { data: nodes, error: nErr } = await supabase
    .from('nodes')
    .select('*')
    .eq('roadmap_id', roadmapId)
    .order('sequence_order', { ascending: true });
  if (nErr) throw nErr;

  return { ...roadmap, nodes };
}
```

### Step 4 — Roadmap Route (`server/routes/roadmap.js`)

```javascript
// Route: POST /api/roadmap/generate — accepts PDF upload, calls Gemini, persists to Supabase
import express from 'express';
import pdfParse from 'pdf-parse';
import upload from '../middleware/upload.js';
import { generateRoadmapFromText } from '../services/geminiService.js';
import { createRoadmap, insertNodes, getRoadmapWithNodes } from '../services/supabaseService.js';

const router = express.Router();

router.post('/generate', upload.single('file'), async (req, res) => {
  try {
    const { time_budget_hours, target_date, user_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!time_budget_hours) return res.status(400).json({ error: 'time_budget_hours required' });

    // Extract text from PDF or TXT
    let rawText = '';
    if (file.mimetype === 'application/pdf') {
      const parsed = await pdfParse(file.buffer);
      rawText = parsed.text;
    } else {
      rawText = file.buffer.toString('utf-8');
    }

    // Truncate to avoid context overflow (first 50k characters)
    const truncatedText = rawText.slice(0, 50000);

    // Call Gemini AI to generate structured roadmap
    const aiResult = await generateRoadmapFromText(truncatedText, parseInt(time_budget_hours));

    // Persist to DB
    const roadmap = await createRoadmap({
      userId: user_id,
      title: aiResult.roadmapTitle,
      timeBudgetHours: parseInt(time_budget_hours),
      targetDate: target_date,
    });

    await insertNodes(roadmap.id, aiResult.nodes);

    // Return full roadmap with nodes
    const fullRoadmap = await getRoadmapWithNodes(roadmap.id);
    res.json({ success: true, roadmap: fullRoadmap });

  } catch (err) {
    console.error('Roadmap generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const roadmap = await getRoadmapWithNodes(req.params.id);
    res.json({ roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

### Step 5 — Node Verification Route (`server/routes/node.js`)

```javascript
// Route: POST /api/node/verify — scores quiz answers, triggers remediation if score < 70
import express from 'express';
import { generateQuizQuestions, evaluateAnswers } from '../services/geminiService.js';
import {
  markNodeCompleted,
  unlockNextNode,
  insertRemediationNode,
} from '../services/supabaseService.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const router = express.Router();

// Generate quiz questions for a node
router.post('/quiz', async (req, res) => {
  try {
    const { node_id } = req.body;
    const { data: node } = await supabase.from('nodes').select('*').eq('id', node_id).single();
    const questions = await generateQuizQuestions(node.title, node.summary);
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit answers and evaluate
router.post('/verify', async (req, res) => {
  try {
    const { node_id, roadmap_id, user_answers, node_title, node_summary, sequence_order } = req.body;

    // Get parent node's remediation depth
    const { data: node } = await supabase
      .from('nodes')
      .select('remediation_depth')
      .eq('id', node_id)
      .single();

    const evaluation = await evaluateAnswers(node_title, node_summary, user_answers);

    let remediationNode = null;

    if (!evaluation.passed && node.remediation_depth < 2) {
      // Insert remediation node into DB
      remediationNode = await insertRemediationNode(
        node_id,
        roadmap_id,
        evaluation.remediation_node,
        node.remediation_depth
      );
    }

    if (evaluation.passed) {
      await markNodeCompleted(node_id);
      await unlockNextNode(roadmap_id, sequence_order);
    }

    // Log the attempt
    await supabase.from('active_recall_logs').insert({
      node_id,
      quiz_score: evaluation.score,
      ai_feedback: evaluation.feedback,
    });

    res.json({
      passed: evaluation.passed,
      score: evaluation.score,
      feedback: evaluation.feedback,
      mutation_triggered: !!remediationNode,
      new_remediation_node: remediationNode,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

---

## 6. AI Layer — Prompt Engineering Contracts

This is the most critical section. Every prompt here is a strict contract. Do not modify the output format instructions without updating the corresponding `JSON.parse` logic.

### `server/services/geminiService.js`

```javascript
// Gemini AI service: generateRoadmapFromText, generateQuizQuestions, evaluateAnswers
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-1.5-flash for speed (switch to gemini-1.5-pro for higher accuracy)
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json', // CRITICAL: Forces JSON-only output, no markdown wrapper
  },
});

// ─── FEATURE 1: Syllabus → Structured JSON Roadmap ────────────────────────────
export async function generateRoadmapFromText(rawText, timeBudgetHours) {
  const prompt = `
You are a strict educational architecture engine.
Analyze the provided course material and break it down into a logical, step-by-step sequential learning path.
The sum of ALL nodes' estimated_minutes MUST equal exactly ${timeBudgetHours * 60} minutes.

Respond ONLY with a valid JSON object matching this exact structure. No prose, no markdown.

{
  "roadmapTitle": "string — concise course name inferred from content",
  "nodes": [
    {
      "sequence_order": 1,
      "title": "string — topic name",
      "summary": "string — 2-3 sentence explanation of what is covered",
      "estimated_minutes": 30
    }
  ]
}

Course Material:
${rawText}
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse and validate
  const parsed = JSON.parse(text);
  if (!parsed.roadmapTitle || !Array.isArray(parsed.nodes)) {
    throw new Error('Gemini returned invalid roadmap structure');
  }
  return parsed;
}

// ─── FEATURE 2a: Generate Quiz Questions for a Node ───────────────────────────
export async function generateQuizQuestions(nodeTitle, nodeSummary) {
  const prompt = `
You are an active recall assessment engine.
Based on the concept below, generate exactly 3 short-answer questions that test genuine understanding (not surface recall).

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

// ─── FEATURE 2b: Evaluate Answers & Generate Remediation if Needed ────────────
export async function evaluateAnswers(nodeTitle, nodeSummary, userAnswers) {
  const answersText = userAnswers
    .map((a) => `Q${a.q_id}: ${a.answer}`)
    .join('\n');

  const prompt = `
You are a strict educational evaluator.
Grade the following answers against the concept taught in this module.

Provide a score from 0 to 100 based on accuracy, completeness, and conceptual understanding.
If score < 70, set "passed" to false and provide a remediation_node targeting the exact gap.
If score >= 70, set "passed" to true and set "remediation_node" to null.

Respond ONLY with this exact JSON object. No prose.

{
  "score": number (0-100),
  "passed": boolean,
  "feedback": "string — specific explanation of what was right or wrong",
  "remediation_node": {
    "title": "Remediation: [specific missing topic]",
    "summary": "string — targeted 2-3 sentence re-explanation of the gap",
    "estimated_minutes": 15
  }
}

Module Title: ${nodeTitle}
Module Summary: ${nodeSummary}

User Answers:
${answersText}
  `;

  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());

  // Safety: ensure remediation_node is null when passed
  if (parsed.passed) parsed.remediation_node = null;

  return parsed;
}
```

**Key Design Decisions:**

| Decision | Reason |
|---|---|
| `responseMimeType: 'application/json'` | Gemini's native structured output mode — eliminates markdown wrapping, prevents `JSON.parse` crashes |
| `gemini-1.5-flash` as default model | 3–5× faster than Pro, sufficient for structured JSON tasks |
| Explicit field validation after parse | Belt-and-suspenders against hallucinated structure |
| `remediation_node: null` safety override | Prevents frontend from trying to render a node when `passed: true` |

---

## 7. Stellar Blockchain Module

### `server/services/stellarService.js`

This module runs only when all nodes in a roadmap are marked `completed`.

```javascript
// Stellar Testnet service: mint proof-of-knowledge receipt as manageData transaction
import {
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

export async function mintProofOfKnowledge(roadmapTitle, finalScore) {
  try {
    const sourceSecretKey = process.env.STELLAR_SECRET_KEY;
    if (!sourceSecretKey) throw new Error('STELLAR_SECRET_KEY not set in environment');

    const sourceKeypair = Keypair.fromSecret(sourceSecretKey);

    // Load the account to get the current sequence number
    const account = await server.loadAccount(sourceKeypair.publicKey());

    // Build a compact, Stellar-compliant key (max 64 bytes, alphanumeric)
    const dataKey = `PulseLearn_${Date.now().toString().slice(-8)}`;

    // Value: course title (truncated) + score (max 64 bytes as a string)
    const rawValue = `${roadmapTitle.slice(0, 40)} | Score: ${finalScore}%`;
    const dataValue = Buffer.from(rawValue, 'utf-8');

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageData({
          name: dataKey,
          value: dataValue,
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(sourceKeypair);

    const result = await server.submitTransaction(tx);

    console.log(`✅ Stellar TX Success. Hash: ${result.hash}`);
    return result.hash;

  } catch (err) {
    // Log but don't crash the app — blockchain step is supplementary
    console.error('Stellar minting failed:', err?.response?.data || err.message);
    return null;
  }
}
```

### How to Get a Funded Testnet Account

```bash
# Generate a new keypair (run this once, save the output securely)
node -e "
const { Keypair } = require('@stellar/stellar-sdk');
const kp = Keypair.random();
console.log('Public Key:', kp.publicKey());
console.log('Secret Key:', kp.secret());
"

# Fund it via the Testnet Friendbot (free, instant)
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY_HERE"
```

Add the secret key to `server/.env` as `STELLAR_SECRET_KEY=S...`.

### Trigger the Mint — Add to `roadmap.js` Route

```javascript
// POST /api/roadmap/:id/complete
import { mintProofOfKnowledge } from '../services/stellarService.js';
import { saveStellarHash, getRoadmapWithNodes } from '../services/supabaseService.js';

router.post('/:id/complete', async (req, res) => {
  try {
    const { final_score } = req.body;
    const roadmap = await getRoadmapWithNodes(req.params.id);

    // Check all non-remediation nodes are completed
    const mainNodes = roadmap.nodes.filter(n => n.sequence_order < 9999);
    const allDone = mainNodes.every(n => n.status === 'completed');
    if (!allDone) return res.status(400).json({ error: 'Not all nodes completed' });

    const txHash = await mintProofOfKnowledge(roadmap.title, final_score);
    if (txHash) await saveStellarHash(roadmap.id, txHash);

    res.json({ success: true, stellar_tx_hash: txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## 8. Frontend — Step-by-Step Build

### Step 1 — Supabase Client (`client/src/lib/supabaseClient.js`)

```javascript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Step 2 — Upload Form Component (`client/src/components/UploadForm.jsx`)

> **GitHub Copilot Tip:** Open this file and type:  
> `// React form component with file input (PDF/TXT), hours number input, and Axios POST to /api/roadmap/generate`

```jsx
import { useState } from 'react';
import axios from 'axios';

export default function UploadForm({ onRoadmapGenerated }) {
  const [file, setFile] = useState(null);
  const [hours, setHours] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please upload a file.');
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('time_budget_hours', hours);
    formData.append('user_id', 'demo-user-id'); // Replace with Supabase auth.user.id

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/roadmap/generate`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      onRoadmapGenerated(data.roadmap);
    } catch (err) {
      setError(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-gray-900 rounded-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Upload Your Syllabus</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 mb-2 text-sm">Course Material (PDF or TXT, max 15MB)</label>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2 text-sm">Total Study Hours</label>
          <input
            type="number"
            min="1"
            max="200"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-indigo-500 outline-none"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
        >
          {loading ? 'Generating Skill Tree...' : 'Generate Learning Path ✨'}
        </button>
      </div>
    </div>
  );
}
```

### Step 3 — Node Card Component (`client/src/components/NodeCard.jsx`)

```jsx
import { Lock, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const statusStyles = {
  locked: 'bg-gray-800 border-gray-700 opacity-50 grayscale cursor-not-allowed',
  unlocked: 'bg-gray-900 border-indigo-500 cursor-pointer animate-pulse-glow',
  completed: 'bg-green-950 border-green-500 cursor-pointer',
};

const StatusIcon = ({ status, score }) => {
  if (status === 'locked') return <Lock className="w-5 h-5 text-gray-500" />;
  if (status === 'completed') return (
    <div className="flex items-center gap-1">
      <CheckCircle className="w-5 h-5 text-green-400" />
      {score && <span className="text-xs text-green-400 font-mono">{score}%</span>}
    </div>
  );
  return <Zap className="w-5 h-5 text-indigo-400" />;
};

export default function NodeCard({ node, onSelect, isSelected, score }) {
  const isClickable = node.status !== 'locked';

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.03 } : {}}
      whileTap={isClickable ? { scale: 0.97 } : {}}
      onClick={() => isClickable && onSelect(node)}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300 w-56
        ${statusStyles[node.status]}
        ${isSelected ? 'ring-2 ring-white' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-400 font-mono">#{node.sequence_order}</span>
        <StatusIcon status={node.status} score={score} />
      </div>
      <h3 className="text-sm font-semibold text-white leading-snug">{node.title}</h3>
      <p className="text-xs text-gray-400 mt-1">{node.estimated_minutes} min</p>
      {node.parent_node_id && (
        <span className="absolute -top-2 left-3 text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">
          Remediation
        </span>
      )}
    </motion.div>
  );
}
```

### Step 4 — Quiz Panel Component (`client/src/components/QuizPanel.jsx`)

```jsx
import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trophy } from 'lucide-react';

export default function QuizPanel({ node, onComplete, onRemediationAdded }) {
  const [phase, setPhase] = useState('summary'); // 'summary' | 'quiz' | 'result'
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/node/quiz`,
      { node_id: node.id }
    );
    setQuestions(data.questions);
    setPhase('quiz');
    setLoading(false);
  };

  const submitAnswers = async () => {
    setLoading(true);
    const userAnswers = questions.map((q) => ({
      q_id: q.q_id,
      answer: answers[q.q_id] || '',
    }));

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/node/verify`,
      {
        node_id: node.id,
        roadmap_id: node.roadmap_id,
        user_answers: userAnswers,
        node_title: node.title,
        node_summary: node.summary,
        sequence_order: node.sequence_order,
      }
    );

    setResult(data);
    setPhase('result');

    if (data.mutation_triggered && data.new_remediation_node) {
      onRemediationAdded(data.new_remediation_node);
    }
    if (data.passed) {
      onComplete(node.id);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-900 rounded-2xl border border-gray-700">
      <AnimatePresence mode="wait">
        {/* SUMMARY PHASE */}
        {phase === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-xl font-bold text-white mb-2">{node.title}</h2>
            <p className="text-gray-400 text-sm mb-1">{node.estimated_minutes} min estimated</p>
            <p className="text-gray-300 leading-relaxed mt-4">{node.summary}</p>
            <button
              onClick={startQuiz}
              disabled={loading}
              className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
            >
              {loading ? 'Loading questions...' : "I'm ready to test my knowledge →"}
            </button>
          </motion.div>
        )}

        {/* QUIZ PHASE */}
        {phase === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <h2 className="text-lg font-bold text-white mb-6">Active Recall Quiz</h2>
            <div className="space-y-6 flex-1 overflow-y-auto">
              {questions.map((q) => (
                <div key={q.q_id}>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    {q.q_id}. {q.question}
                  </label>
                  <textarea
                    rows={3}
                    value={answers[q.q_id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.q_id]: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:border-indigo-500 outline-none resize-none"
                    placeholder="Type your answer..."
                  />
                </div>
              ))}
            </div>
            <button
              onClick={submitAnswers}
              disabled={loading}
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
            >
              {loading ? 'Evaluating...' : 'Submit Answers'}
            </button>
          </motion.div>
        )}

        {/* RESULT PHASE */}
        {phase === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {result.passed ? (
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400">Passed! {result.score}%</h2>
                <p className="text-gray-400 mt-2">{result.feedback}</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                  <h2 className="text-xl font-bold text-orange-400">Score: {result.score}%</h2>
                </div>
                <p className="text-gray-300 text-sm">{result.feedback}</p>
                {result.mutation_triggered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-orange-900/40 border border-orange-600 rounded-xl"
                  >
                    <p className="text-orange-300 text-sm font-semibold">
                      ⚡ Remediation node added to your skill tree!
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{result.new_remediation_node?.title}</p>
                  </motion.div>
                )}
                <button
                  onClick={() => setPhase('summary')}
                  className="mt-6 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm"
                >
                  Review & Retry
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Step 5 — Skill Tree Canvas (`client/src/components/SkillTree.jsx`)

```jsx
import { useRef, useEffect } from 'react';
import NodeCard from './NodeCard';

export default function SkillTree({ nodes, onNodeSelect, selectedNode, scores }) {
  const svgRef = useRef(null);

  // Sort main nodes by sequence, append remediation nodes at the end
  const mainNodes = nodes.filter(n => n.sequence_order < 9999);
  const remediationNodes = nodes.filter(n => n.sequence_order === 9999);

  return (
    <div className="relative w-full h-full overflow-auto p-8">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {/* SVG bezier lines are drawn dynamically via useEffect — 
            GitHub Copilot can generate this by typing: 
            // draw bezier curve between consecutive node cards using their DOM positions */}
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {mainNodes.map((node) => {
          // Find remediation children
          const remediations = remediationNodes.filter(r => r.parent_node_id === node.id);
          return (
            <div key={node.id} className="flex flex-col items-center gap-4">
              <NodeCard
                node={node}
                onSelect={onNodeSelect}
                isSelected={selectedNode?.id === node.id}
                score={scores[node.id]}
              />
              {remediations.length > 0 && (
                <div className="flex gap-4 ml-16 border-l-2 border-orange-600 pl-6">
                  {remediations.map((rNode) => (
                    <NodeCard
                      key={rNode.id}
                      node={rNode}
                      onSelect={onNodeSelect}
                      isSelected={selectedNode?.id === rNode.id}
                      score={scores[rNode.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Step 6 — Stellar Completion Modal (`client/src/components/StellarModal.jsx`)

```jsx
import { motion } from 'framer-motion';
import { ExternalLink, Award } from 'lucide-react';

export default function StellarModal({ txHash, roadmapTitle, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="bg-gray-900/90 border border-indigo-500 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl shadow-indigo-500/20"
      >
        <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Course Complete! 🎉</h2>
        <p className="text-indigo-300 font-medium mb-1">{roadmapTitle}</p>
        <p className="text-gray-400 text-sm mb-6">
          Your proof of knowledge has been permanently anchored on the Stellar Blockchain.
        </p>

        {txHash ? (
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
            <p className="text-xs text-green-400 font-mono break-all">{txHash}</p>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs text-indigo-400 hover:text-indigo-300"
            >
              View on Stellar Expert <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-6">Blockchain anchor unavailable — credential recorded locally.</p>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
        >
          Return to Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
}
```

---

## 9. API Contract Reference

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `POST` | `/api/roadmap/generate` | `file, time_budget_hours, user_id` | `{ roadmap: { id, title, nodes[] } }` |
| `GET` | `/api/roadmap/:id` | — | `{ roadmap: { ...roadmap, nodes[] } }` |
| `POST` | `/api/roadmap/:id/complete` | `{ final_score }` | `{ stellar_tx_hash }` |
| `POST` | `/api/node/quiz` | `{ node_id }` | `{ questions: [{ q_id, question }] }` |
| `POST` | `/api/node/verify` | `{ node_id, roadmap_id, user_answers[], node_title, node_summary, sequence_order }` | `{ passed, score, feedback, mutation_triggered, new_remediation_node }` |

---

## 10. Edge Cases & Mitigations

### Edge Case 1 — Large PDF Context Overflow

- **Problem:** A 300-page PDF can exceed Gemini's practical output quality threshold even if it fits in context.
- **Mitigation:** In `roadmap.js` route, truncate `rawText` to 50,000 characters before sending to Gemini. Display a UI warning if the file exceeds 5MB.

### Edge Case 2 — JSON.parse Crashes

- **Problem:** Gemini occasionally appends `"Here is your JSON:"` prefix or adds trailing comments.
- **Mitigation (already in code):** `responseMimeType: 'application/json'` in model config forces clean JSON. Add this secondary safety wrapper:

```javascript
function safeParseGemini(text) {
  // Strip any lingering markdown fences just in case
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
```

### Edge Case 3 — Infinite Remediation Loops

- **Problem:** A user repeatedly fails the same concept → hundreds of child nodes.
- **Mitigation (already in schema):** The `remediation_depth` column on the `nodes` table. Check in `/api/node/verify`:

```javascript
if (!evaluation.passed && node.remediation_depth < 2) {
  // Insert remediation node
} else if (!evaluation.passed && node.remediation_depth >= 2) {
  // Flag node for manual review, auto-unlock next node
  await supabase.from('nodes')
    .update({ status: 'completed', title: node.title + ' [Needs Review]' })
    .eq('id', node_id);
  await unlockNextNode(roadmap_id, sequence_order);
}
```

### Edge Case 4 — Stellar Transaction Failure

- **Problem:** Network timeout or insufficient balance on testnet account.
- **Mitigation:** `mintProofOfKnowledge` returns `null` on failure (not a thrown error). The completion flow continues and records the credential locally. UI shows: *"Blockchain anchor unavailable — credential recorded locally."*

### Edge Case 5 — All Nodes Already Completed Check

- **Problem:** User navigates back and clicks complete again.
- **Mitigation:** The `/api/roadmap/:id/complete` route checks `mainNodes.every(n => n.status === 'completed')` and returns `400` if not all done.

---

## 11. Environment Variables Reference

**`server/.env`**

```env
PORT=3001
CLIENT_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key

# Gemini AI
GEMINI_API_KEY=AIza...your_gemini_api_key

# Stellar Testnet
STELLAR_SECRET_KEY=S...your_testnet_secret_key
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_anon_key
```

---

## 12. Deployment Checklist

### Backend → Render

1. Push `server/` directory to GitHub.
2. On Render: New → Web Service → connect repo → set **Root Directory** to `server`.
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add all `server/.env` variables in Render's Environment tab.
6. Copy the Render URL (e.g. `https://pulse-learn-api.onrender.com`).

### Frontend → Vercel

1. Push `client/` directory to GitHub.
2. On Vercel: New Project → connect repo → set **Root Directory** to `client`.
3. Framework preset: Vite.
4. Add `client/.env` variables in Vercel's Environment Variables section — **update `VITE_API_URL`** to the Render URL.
5. Deploy.

---

## 13. GitHub Copilot Prompt Cheatsheet

Use these as the first comment in each new file to get Copilot scaffolding immediately:

| File | Copilot Trigger Comment |
|---|---|
| `server/index.js` | `// Express server with cors, multer, dotenv, routes for roadmap and node` |
| `server/services/geminiService.js` | `// Gemini 1.5 Flash service with responseMimeType json, functions: generateRoadmap, generateQuiz, evaluateAnswers` |
| `server/services/stellarService.js` | `// Stellar Testnet manageData transaction using @stellar/stellar-sdk, returns transaction hash` |
| `server/services/supabaseService.js` | `// Supabase service_role client: CRUD for roadmaps, nodes, active_recall_logs` |
| `client/src/components/SkillTree.jsx` | `// React component rendering nodes as cards connected by SVG bezier curves, shows locked/unlocked/completed states` |
| `client/src/components/QuizPanel.jsx` | `// React quiz panel with three phases: summary, quiz (textarea per question), result with remediation alert` |
| `client/src/components/StellarModal.jsx` | `// Glassmorphism fullscreen modal showing stellar transaction hash with link to stellar.expert` |
| `client/src/hooks/useRoadmap.js` | `// Custom React hook to fetch roadmap by id from Express API, manage loading and error state` |

---

*PRD Version 1.0 — Pulse-Learn AI — Built for Hackathon Sprint*
