import { GoogleGenerativeAI } from '@google/generative-ai';
import { MBTI_AI_PROFILES } from '../lib/mbtiProfiles.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { responseMimeType: 'application/json' },
});

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

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = JSON.parse(text);
  if (parsed.passed) parsed.remediation_node = null;
  return parsed;
}

export async function workspaceChat(message, history, userProfile, workspaceNotes = '') {
  const personalityContext = buildPersonalityContext(userProfile, workspaceNotes);
  const modelNoJson = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chat = modelNoJson.startChat({
    history: history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    generationConfig: {
      maxOutputTokens: 500,
    },
  });

  const prompt = `
${personalityContext}

You are the user's personal learning companion. 
Your goal is to help them synthesize information across their workspace, answer questions, and provide guidance.
You have access to their authored workspace notes below.

WORKSPACE NOTES:
${workspaceNotes}

Always maintain your ${userProfile.mbti_type} persona as defined in the context above.
Be concise, insightful, and environment-aware.

User Message: ${message}
  `;

  const result = await chat.sendMessage(prompt);
  return result.response.text();
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

  const recapModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
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

export async function workspaceChat({ messages, pageContext, mbtiType, profile }) {
  const userProfile = profile || { mbti_type: mbtiType };
  const personalityContext = buildPersonalityContext(userProfile);
  const modelNoJson = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const history = (messages || []).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chat = modelNoJson.startChat({ history, generationConfig: { maxOutputTokens: 500 } });

  const prompt = `
${personalityContext}

You are the user's personal learning companion. Use the workspace context below to answer clearly.

Workspace notes:
${pageContext}

User message: ${messages?.at(-1)?.content || ''}
`;

  const result = await chat.sendMessage(prompt);
  return result.response.text();
}
