import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpError } from '../utils/httpError.js';

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = client.getGenerativeModel({ model: 'gemini-pro' });

export async function generateRoadmapFromText(syllabusText) {
  if (!syllabusText || typeof syllabusText !== 'string') {
    throw new HttpError('Syllabus text is required to generate a roadmap.', 400, 'invalid_input');
  }

  const prompt = `Extract a JSON array of learning nodes from the syllabus text. Use the following node schema: title, summary, estimatedMinutes, parentNodeId, status, remediationDepth. Respond with valid JSON only.`;
  const content = `${prompt}\n\nSyllabus:\n${syllabusText}`;

  let result;
  try {
    result = await model.generateContent(content);
  } catch (error) {
    throw new HttpError('Failed to generate roadmap nodes from text.', 502, 'ai_service_error');
  }

  const output = extractText(result) || '';
  return parseRoadmapNodes(output);
}

function parseRoadmapNodes(rawText) {
  const jsonText = extractJson(rawText);

  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      throw new Error('Expected an array of nodes');
    }
    return parsed.map(normalizeNode);
  } catch (error) {
    return fallbackToLines(rawText);
  }
}

function extractJson(text) {
  if (!text) return '[]';
  const first = text.indexOf('[');
  const last = text.lastIndexOf(']');
  if (first !== -1 && last !== -1) {
    return text.slice(first, last + 1);
  }
  return text;
}

function normalizeNode(node, index) {
  return {
    title: String(node?.title || `Node ${index + 1}`).trim(),
    summary: String(node?.summary || '').trim(),
    estimatedMinutes: parseInt(node?.estimatedMinutes, 10) || 20,
    parentNodeId: node?.parentNodeId || null,
    status: String(node?.status || (index === 0 ? 'unlocked' : 'locked')).trim(),
    remediationDepth: parseInt(node?.remediationDepth, 10) || 0,
  };
}

function fallbackToLines(rawText) {
  const lines = String(rawText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => ({
    title: `Node ${index + 1}`,
    summary: line,
    estimatedMinutes: 20,
    parentNodeId: null,
    status: index === 0 ? 'unlocked' : 'locked',
    remediationDepth: 0,
  }));
}

export async function verifyNodeAnswer({ userAnswer, expectedSummary }) {
  if (!userAnswer || !expectedSummary) {
    throw new HttpError('Both userAnswer and expectedSummary are required for verification.', 400, 'invalid_input');
  }

  const prompt = `Assess whether the following answer demonstrates correct understanding of the expected concept. Return an object with score (0-1) and feedback.\n\nExpected summary: ${expectedSummary}\n\nStudent answer: ${userAnswer}`;

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error) {
    throw new HttpError('AI verification failed.', 502, 'ai_service_error');
  }

  const feedback = extractText(result) || 'Unable to verify answer.';
  const score = parseScore(feedback);
  return { score, feedback };
}

function extractText(result) {
  const response = result?.response;
  const candidate = response?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  return parts.map((part) => part.text || '').join('').trim();
}

function parseScore(feedback) {
  const normalized = String(feedback).toLowerCase();
  if (normalized.includes('correct') || normalized.includes('accurate')) return 0.9;
  if (normalized.includes('partially')) return 0.7;
  if (normalized.includes('incorrect') || normalized.includes('not')) return 0.4;
  return 0.5;
}
