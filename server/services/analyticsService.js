// Analytics service: NL query → Gemini interprets → SQL data → Recharts JSON config
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { responseMimeType: 'application/json' },
});

// ── STEP 1: Fetch all raw analytics data for a user ───────────────────────────
async function fetchUserAnalyticsData(userId) {
  // Quiz scores over time
  const { data: quizLogs } = await supabase
    .from('active_recall_logs')
    .select(`
      quiz_score,
      completed_at,
      node_id,
      nodes (title, estimated_minutes, roadmap_id,
        roadmaps (title)
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: true });

  // Node statuses for all roadmaps the user has access to
  const { data: nodeStatuses } = await supabase
    .from('nodes')
    .select(`
      status,
      estimated_minutes,
      title,
      roadmap_id,
      roadmaps!inner (title, owner_id)
    `)
    .or(`roadmaps.owner_id.eq.${userId}`);

  return { quizLogs: quizLogs || [], nodeStatuses: nodeStatuses || [] };
}

// ── STEP 2: Ask Gemini to interpret the NL query and build chart config ────────
export async function processAnalyticsQuery(nlQuery, userId, userProfile) {
  const rawData = await fetchUserAnalyticsData(userId);

  const prompt = `
You are a data analyst for an educational AI platform.
The user has asked: "${nlQuery}"

Here is their raw learning data as JSON:
${JSON.stringify(rawData, null, 2)}

Your job is to:
1. Identify which chart type best answers the question (line, bar, horizontalBar, pie, radar, area)
2. Extract and transform the relevant data from the raw data above
3. Return a Recharts-compatible configuration

CRITICAL: Respond ONLY with this exact JSON structure. No prose, no markdown.

{
  "chartType": "line" | "bar" | "horizontalBar" | "pie" | "radar" | "area",
  "title": "string — concise chart title answering the user's question",
  "description": "string — one sentence insight from the data",
  "data": [
    { "label": "string", "value": number, "secondaryValue": number | null }
  ],
  "xAxisLabel": "string",
  "yAxisLabel": "string",
  "color": "#6366f1"
}

Rules:
- "data" must have at least 2 data points to be meaningful
- "label" is what goes on the axis (e.g. node title, date, roadmap name)
- "value" is the primary metric (e.g. score, minutes, count)
- If no relevant data exists, set "data" to [] and explain in "description"
- For pie charts, "value" represents the slice size
  `;

  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());

  // Safety override — Fallback to bar chart if type is invalid
  const VALID_TYPES = ['line', 'bar', 'horizontalBar', 'pie', 'radar', 'area'];
  if (!VALID_TYPES.includes(parsed.chartType)) {
    parsed.chartType = 'bar';
  }

  return parsed;
}
