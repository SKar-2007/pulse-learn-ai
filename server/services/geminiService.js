import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpError } from '../utils/httpError.js';

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = client.getGenerativeModel({ model: 'gemini-pro' });

async function extractTextFromResult(result) {
  if (!result) return '';
  if (typeof result.response?.text === 'function') {
    const text = await result.response.text();
    return String(text || '').trim();
  }
  const candidate = result?.response?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  return parts.map((part) => part.text || '').join('').trim();
}

function parseJsonOutput(rawText) {
  if (!rawText) return null;
  const first = rawText.indexOf('{');
  const last = rawText.lastIndexOf('}');
  const payload = first !== -1 && last !== -1 ? rawText.slice(first, last + 1) : rawText;
  try {
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}

function parseJsonArray(rawText) {
  if (!rawText) return null;
  const first = rawText.indexOf('[');
  const last = rawText.lastIndexOf(']');
  const payload = first !== -1 && last !== -1 ? rawText.slice(first, last + 1) : rawText;
  try {
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}

export async function generateRoadmapFromText(syllabusText, timeBudgetHours = 10) {
  if (!syllabusText || typeof syllabusText !== 'string') {
    throw new HttpError('Syllabus text is required to generate a roadmap.', 400, 'invalid_input');
  }

  const prompt = `You are a learning architect. Analyze the course material and return ONLY valid JSON. The total estimated_minutes of all nodes MUST equal ${timeBudgetHours * 60}. Respond with this exact structure:\n{\n  "roadmapTitle": "string",\n  "nodes": [\n    {\n      "sequence_order": 1,\n      "title": "string",\n      "summary": "string",\n      "estimated_minutes": 30\n    }\n  ]\n}`;

  let result;
  try {
    result = await model.generateContent(`${prompt}\n\nCourse Material:\n${syllabusText}`);
  } catch (error) {
    throw new HttpError('Failed to generate roadmap nodes from text.', 502, 'ai_service_error');
  }

  const output = await extractTextFromResult(result);
  const parsed = parseJsonOutput(output);
  if (!parsed || !parsed.roadmapTitle || !Array.isArray(parsed.nodes)) {
    throw new HttpError('Gemini returned invalid roadmap structure.', 502, 'ai_invalid_response');
  }

  return {
    roadmapTitle: String(parsed.roadmapTitle).trim(),
    nodes: parsed.nodes.map(normalizeNode),
  };
}

export async function generateQuizQuestions(nodeTitle, nodeSummary) {
  if (!nodeTitle || !nodeSummary) {
    throw new HttpError('Node title and summary are required to generate questions.', 400, 'invalid_input');
  }

  const prompt = `Generate exactly 3 short-answer quiz questions to assess the concept. Respond ONLY with an array of 3 objects, each containing q_id and question.`;

  let result;
  try {
    result = await model.generateContent(`${prompt}\n\nConcept Title: ${nodeTitle}\nConcept Summary: ${nodeSummary}`);
  } catch (error) {
    throw new HttpError('Failed to generate quiz questions.', 502, 'ai_service_error');
  }

  const output = await extractTextFromResult(result);
  const questions = parseJsonArray(output);
  if (!questions || !Array.isArray(questions)) {
    throw new HttpError('Gemini returned invalid quiz questions.', 502, 'ai_invalid_response');
  }

  return questions.slice(0, 3).map((question, index) => ({
    q_id: question.q_id ?? index + 1,
    question: String(question.question || question.prompt || `Explain ${nodeTitle}`).trim(),
  }));
}

export async function evaluateAnswers(nodeTitle, nodeSummary, userAnswers) {
  if (!nodeTitle || !nodeSummary || !Array.isArray(userAnswers) || !userAnswers.length) {
    throw new HttpError('Node title, summary, and answers are required for evaluation.', 400, 'invalid_input');
  }

  const answersText = userAnswers
    .map((a) => `Q${a.q_id}: ${a.answer || a.response || ''}`)
    .join('\n');

  const prompt = `Evaluate the answers and return ONLY valid JSON with score (0-100), passed, feedback, and remediation_node. If score >= 70, set remediation_node to null.`;

  let result;
  try {
    result = await model.generateContent(`${prompt}\n\nConcept Title: ${nodeTitle}\nConcept Summary: ${nodeSummary}\n\nUser Answers:\n${answersText}`);
  } catch (error) {
    throw new HttpError('AI evaluation failed.', 502, 'ai_service_error');
  }

  const output = await extractTextFromResult(result);
  const parsed = parseJsonOutput(output);
  if (!parsed || typeof parsed.score !== 'number' || typeof parsed.passed !== 'boolean') {
    throw new HttpError('Gemini returned invalid evaluation structure.', 502, 'ai_invalid_response');
  }

  return {
    score: Math.max(0, Math.min(100, parsed.score)),
    passed: Boolean(parsed.passed),
    feedback: String(parsed.feedback || 'No feedback provided.'),
    remediation_node: parsed.passed ? null : parsed.remediation_node || null,
  };
}

function normalizeNode(node, index) {
  return {
    sequence_order: Number(node.sequence_order || index + 1),
    title: String(node.title || `Node ${index + 1}`).trim(),
    summary: String(node.summary || '').trim(),
    estimated_minutes: Number(node.estimated_minutes || node.estimatedMinutes || 20),
  };
}
