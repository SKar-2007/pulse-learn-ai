import { TextServiceClient } from '@google/generative-ai';

const client = new TextServiceClient();

export async function generateRoadmapFromText(syllabusText) {
  const prompt = `Extract a JSON array of learning nodes from the syllabus text. Use the following node schema: title, summary, estimatedMinutes, parentNodeId, status, remediationDepth. Respond with valid JSON only.`;

  const response = await client.generateText({
    model: 'gemini-pro',
    prompt: {
      text: `${prompt}\n\nSyllabus:\n${syllabusText}`,
    },
  });

  const output = response?.result?.content?.[0]?.text || '';
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
  const first = text.indexOf('[');
  const last = text.lastIndexOf(']');
  if (first !== -1 && last !== -1) {
    return text.slice(first, last + 1);
  }
  return text;
}

function normalizeNode(node, index) {
  return {
    title: String(node.title || `Node ${index + 1}`).trim(),
    summary: String(node.summary || '').trim(),
    estimatedMinutes: parseInt(node.estimatedMinutes, 10) || 20,
    parentNodeId: node.parentNodeId || null,
    status: node.status || (index === 0 ? 'unlocked' : 'locked'),
    remediationDepth: node.remediationDepth || 0,
  };
}

function fallbackToLines(rawText) {
  const lines = rawText
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
  const prompt = `Assess whether the following answer demonstrates correct understanding of the expected concept. Return an object with score (0-1) and feedback.\n\nExpected summary: ${expectedSummary}\n\nStudent answer: ${userAnswer}`;

  const response = await client.generateText({
    model: 'gemini-pro',
    prompt: { text: prompt },
  });

  const feedback = response?.result?.content?.[0]?.text || 'Unable to verify answer.';
  const score = feedback.toLowerCase().includes('correct') ? 0.9 : 0.5;

  return { score, feedback };
}
