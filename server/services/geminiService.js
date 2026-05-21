import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { responseMimeType: 'application/json' },
});

// ── PERSONALITY CONTEXT BUILDER ───────────────────────────────────────────────
export function buildPersonalityContext(profile) {
  if (!profile) return ''; // Graceful fallback — no personalization if no profile yet

  const toneInstructions = {
    friendly: 'Use warm, encouraging language. Celebrate small wins. Use "you" directly.',
    direct: 'Be concise and precise. No filler phrases. Lead with the key point.',
    socratic: 'Pose guiding questions within your explanation to prompt the user to think. Do not just state facts.',
    formal: 'Use academic, precise language. Reference concepts formally. Avoid contractions.',
  };

  const levelInstructions = {
    beginner: 'Assume zero prior knowledge. Define every technical term when first used. Use simple analogies.',
    intermediate: 'Assume basic familiarity. Skip foundational definitions. Focus on "why" not just "what".',
    advanced: 'Assume strong background. Use technical vocabulary freely. Focus on nuance and edge cases.',
    expert: 'Treat the user as a peer. Assume deep expertise. Surface only what is non-obvious.',
  };

  const styleInstructions = {
    visual: 'Structure explanations as if describing a diagram. Use spatial metaphors. Break into labeled sections.',
    reading: 'Write dense, well-structured prose. Use headers and sub-points. Prefer written depth.',
    kinesthetic: 'Ground every concept in a concrete example or worked problem. Lead with the example, explain after.',
    auditory: 'Write conversationally as if speaking out loud. Use rhythm and repetition naturally.',
  };

  const domainAnalogies = {
    computer_science: 'Use programming, systems, and algorithm analogies where possible.',
    medicine: 'Use clinical, biological, or patient-care analogies where possible.',
    business: 'Use business strategy, market, or financial analogies where possible.',
    humanities: 'Use historical, philosophical, or societal analogies where possible.',
  };

  const mbtiInstructions = {
    // NT (Analysts) - Logical, systems-focused
    INTJ: 'Explain things using strategic frameworks and systems. Focus on logical efficiency.',
    INTP: 'Dive deep into theoretical principles and abstract concepts. Encourage curiosity.',
    ENTJ: 'Focus on strategic outcomes and mastery of the subject matter.',
    ENTP: 'Focus on innovative connections and brainstorming potential applications.',
    // NF (Diplomats) - Empathetic, big-picture
    INFJ: 'Focus on deep meaning and human impact of the concepts.',
    INFP: 'Use imaginative analogies and focus on personal growth/values.',
    ENFJ: 'Focus on collaborative potential and broad societal impact.',
    ENFP: 'Be enthusiastic and focus on creative big-picture possibilities.',
    // SJ (Sentinels) - Detailed, practical
    ISTJ: 'Provide step-by-step, detail-oriented explanations. Focus on accuracy.',
    ISFJ: 'Provide practical, supportive, and well-structured guidance.',
    ESTJ: 'Focus on efficient implementation and clear rules/standards.',
    ESFJ: 'Provide practical, community-focused, and supportive explanations.',
    // SP (Explorers) - Hands-on, spontaneous
    ISTP: 'Focus on the mechanics and practical utility of the concepts.',
    ISFP: 'Focus on aesthetic appeal and hands-on, sensory experiences.',
    ESTP: 'Be dynamic, focused on immediate application and "real-world" action.',
    ESFP: 'Be engaging, focused on fun, practical, and immediate benefits.',
  };

  return `
=== LEARNER PERSONALITY PROFILE ===
MBTI Type: ${profile.mbti_type || 'Unknown'}
→ ${mbtiInstructions[profile.mbti_type] || 'Use balanced cognitive approaches.'}

Expertise Level: ${profile.expertise_level}
→ ${levelInstructions[profile.expertise_level] || ''}

Communication Tone: ${profile.communication_tone}
→ ${toneInstructions[profile.communication_tone] || ''}

Learning Style: ${profile.learning_style}
→ ${styleInstructions[profile.learning_style] || ''}

Domain Context: ${profile.study_domain || 'general'}
→ ${domainAnalogies[profile.study_domain] || 'Use general-purpose analogies.'}

Preferred Session Length: ${profile.preferred_session_minutes} minutes
→ When estimating node time, bias toward chunks of approximately ${profile.preferred_session_minutes} minutes.
====================================
`;
}

// Updated generateRoadmapFromText
export async function generateRoadmapFromText(rawText, timeBudgetHours, userProfile) {
  const personalityContext = buildPersonalityContext(userProfile);

  const prompt = `
${personalityContext}

You are a strict educational architecture engine.
Adapt the depth, vocabulary, and framing of each node's summary to match the learner profile above.
The sum of ALL nodes' estimated_minutes MUST equal exactly ${timeBudgetHours * 60} minutes.
Bias each node's estimated_minutes toward multiples of ${userProfile?.preferred_session_minutes || 30} minutes.

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
export async function generateQuizQuestions(nodeTitle, nodeSummary, userProfile) {
  const personalityContext = buildPersonalityContext(userProfile);

  const prompt = `
${personalityContext}

You are an active recall assessment engine.
Generate exactly 3 questions that test genuine understanding of the concept below.
Frame the questions using the learner's domain and tone preferences from the profile above.
For a 'socratic' tone: make questions probing and open-ended.
For a 'kinesthetic' style: make questions ask the user to solve a scenario, not just recite.
For a 'beginner' level: ask conceptual questions, not implementation details.

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
export async function evaluateAnswers(nodeTitle, nodeSummary, userAnswers, userProfile) {
  const personalityContext = buildPersonalityContext(userProfile);
  const answersText = userAnswers.map(a => `Q${a.q_id}: ${a.answer}`).join('\n');

  const prompt = `
${personalityContext}

You are a strict but empathetic educational evaluator.
Grade the following answers. Adapt your feedback to the learner's communication tone and expertise level.
For 'encouraging' tone: frame gaps as "next steps", not failures.
For 'direct' tone: state the gap precisely in one sentence, no softening.
For 'beginner' level: explain what was missed in plain language with an example.

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
