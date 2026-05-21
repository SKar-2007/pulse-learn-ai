import { GoogleGenerativeAI } from '@google/generative-ai';
import { MBTI_AI_PROFILES } from '../lib/mbtiProfiles.js';

const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;
const requestOptions = { apiVersion: 'v1' };
const PRIMARY_MODEL = process.env.GEMINI_PRIMARY_MODEL || 'gemini-1.5-pro';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-flash';
const LOCAL_LLM_URL = process.env.LLAMA_API_URL || process.env.LOCAL_LLM_URL || '';
const LOCAL_LLM_MODEL = process.env.LLAMA_MODEL_NAME || process.env.LOCAL_LLM_MODEL || 'llama2';

function isDemoMode(profile = {}) {
  return process.env.DEMO_MODE === 'true'
    || profile?.id === 'demo-user'
    || profile?.email === 'demo@pulse.test'
    || profile?.demo_mode === true;
}

function getGenModel(modelName, options = {}) {
  if (!genAI) {
    throw new Error('Google Gemini API key is not configured.');
  }
  return genAI.getGenerativeModel({ model: modelName, ...options }, requestOptions);
}

function isLocalLlamaEnabled() {
  return Boolean(LOCAL_LLM_URL);
}

function parseLocalLlamaResult(data) {
  if (!data) return null;
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  if (data.choices?.[0]?.text) {
    return data.choices[0].text;
  }
  if (typeof data.generated_text === 'string') {
    return data.generated_text;
  }
  if (Array.isArray(data.output) && data.output[0]?.content?.[0]?.text) {
    return data.output[0].content[0].text;
  }
  return null;
}

async function requestLocalLlama(prompt) {
  const baseUrl = LOCAL_LLM_URL.replace(/\/$/, '');
  const endpoints = [
    {
      path: '/v1/chat/completions',
      body: {
        model: LOCAL_LLM_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      },
    },
    {
      path: '/v1/completions',
      body: {
        model: LOCAL_LLM_MODEL,
        prompt,
        temperature: 0.7,
        max_tokens: 500,
      },
    },
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endpoint.body),
      });
      const data = await response.json();

      if (!response.ok) {
        lastError = new Error(`Local Llama request failed ${response.status}: ${JSON.stringify(data)}`);
        continue;
      }

      const text = parseLocalLlamaResult(data);
      if (text) {
        return text;
      }

      lastError = new Error('Local Llama returned an unexpected response format.');
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Builds a personality context prompt for Gemini based on user profile and preferences.
 */
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

// Updated generateRoadmapFromText
export async function generateRoadmapFromText(rawText, timeBudgetHours, userProfile, workspaceNotes = '') {
  const personalityContext = buildPersonalityContext(userProfile, workspaceNotes);

  const prompt = `
${personalityContext}

You are a strict educational architecture engine.
Adapt the depth, vocabulary, and framing of each node's summary to match the learner profile above.
The sum of ALL nodes' estimated_minutes MUST equal exactly ${timeBudgetHours * 60} minutes.

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

  const model = getGenModel(PRIMARY_MODEL, { generationConfig: { responseMimeType: 'application/json' } });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}

// Updated generateQuizQuestions
export async function generateQuizQuestions(nodeTitle, nodeSummary, userProfile, workspaceNotes = '') {
  const personalityContext = buildPersonalityContext(userProfile, workspaceNotes);

  const prompt = `
${personalityContext}

You are an active recall assessment engine.
Generate exactly 3 questions that test genuine understanding of the concept below.
Frame the questions using the learner's domain and tone preferences from the profile above.

Respond ONLY with a JSON array of exactly 3 objects. No prose.

[
  { "q_id": 1, "question": "string" },
  { "q_id": 2, "question": "string" },
  { "q_id": 3, "question": "string" }
]

Concept Title: ${nodeTitle}
Concept Summary: ${nodeSummary}
  `;

  const model = getGenModel(PRIMARY_MODEL, { generationConfig: { responseMimeType: 'application/json' } });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}

// Updated evaluateAnswers
export async function evaluateAnswers(nodeTitle, nodeSummary, userAnswers, userProfile, workspaceNotes = '') {
  const personalityContext = buildPersonalityContext(userProfile, workspaceNotes);
  const answersText = userAnswers.map(a => `Q${a.q_id}: ${a.answer}`).join('\n');

  const prompt = `
${personalityContext}

You are a strict but empathetic educational evaluator.
Grade the following answers. Adapt your feedback to the learner's communication tone and expertise level.

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

  const model = getGenModel(PRIMARY_MODEL, { generationConfig: { responseMimeType: 'application/json' } });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = JSON.parse(text);
  if (parsed.passed) parsed.remediation_node = null;
  return parsed;
}

export async function workspaceChat(messageOrPayload, history = [], userProfile, workspaceNotes = '') {
  let messages = null;
  let pageContext = '';
  let inputMessage = '';
  let inputHistory = [];
  let effectiveProfile = userProfile || {};

  if (typeof messageOrPayload === 'object' && messageOrPayload !== null && !Array.isArray(messageOrPayload)) {
    const payload = messageOrPayload;
    messages = payload.messages || [];
    pageContext = payload.pageContext || '';
    effectiveProfile = payload.profile || effectiveProfile;
    if (!effectiveProfile.mbti_type && payload.mbtiType) {
      effectiveProfile = { ...effectiveProfile, mbti_type: payload.mbtiType };
    }
    inputMessage = messages?.at(-1)?.content || '';
    inputHistory = (messages || []).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  } else {
    inputMessage = messageOrPayload;
    inputHistory = (history || []).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || msg }],
    }));
    pageContext = workspaceNotes || '';
  }

  const personalityContext = buildPersonalityContext(effectiveProfile, pageContext);
  const prompt = `
${personalityContext}

You are the user's personal learning companion. Use the workspace context below to answer clearly.

Workspace notes:
${pageContext}

User message: ${inputMessage}
`;

  if (isDemoMode(effectiveProfile)) {
    return 'Demo AI mode: a lightweight response is returned here while demo mode is active. Switch to a full account to access the connected Gemini assistant.';
  }

  if (isLocalLlamaEnabled()) {
    try {
      return await requestLocalLlama(prompt);
    } catch (localError) {
      console.warn('Local Llama request failed, falling back to Gemini:', localError?.message || localError);
    }
  }

  if (!genAI) {
    return 'AI is unavailable because the Gemini API key is not configured. Please enable GOOGLE_API_KEY or configure a local Llama model via LLAMA_API_URL.';
  }

  try {
    const modelNoJson = getGenModel(PRIMARY_MODEL);
    const chat = modelNoJson.startChat({
      history: inputHistory,
      generationConfig: { maxOutputTokens: 500 },
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (primaryError) {
    console.warn('Primary Gemini model failed, falling back to', FALLBACK_MODEL, primaryError?.message || primaryError);
    const fallbackModel = getGenModel(FALLBACK_MODEL);
    const fallbackResponse = await fallbackModel.generateContent(prompt);
    return fallbackResponse.response.text();
  }
}

export async function generateRecap({ pageContext, mbtiType }) {
  const personalityContext = buildPersonalityContext({ mbti_type: mbtiType });
  const prompt = `
${personalityContext}

You are a learning recap engine.
Create a structured recap for the workspace page context below.
Return only valid JSON with the keys: headline, completedNodes, weakAreas, collaboratorActivity, nextSteps, studyTimeToday.

Page context:
${pageContext}
`;

  if (!genAI) {
    return { headline: 'Demo recap', completedNodes: [], weakAreas: [], collaboratorActivity: [], nextSteps: [], studyTimeToday: '' };
  }

  const recapModel = getGenModel(PRIMARY_MODEL, {
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await recapModel.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Recap parse failed, returning raw text', error, text);
    return { headline: text, completedNodes: [], weakAreas: [], collaboratorActivity: [], nextSteps: [], studyTimeToday: '' };
  }
}

