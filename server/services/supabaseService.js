import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getUserFromAccessToken(accessToken) {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) throw error;
  if (!data?.user) throw new Error('Invalid auth token');
  return data.user;
}

export async function ensureUserRecord(user) {
  if (!user?.id) throw new Error('Missing user id');
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: user.id, email: user.email }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createRoadmap({ userId, userEmail, title, timeBudgetHours, targetDate }) {
  await ensureUserRecord({ id: userId, email: userEmail });

  const { data, error } = await supabase
    .from('roadmaps')
    .insert({
      user_id: userId,
      title,
      time_budget_hours: timeBudgetHours,
      target_date: targetDate,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRoadmapById(roadmapId) {
  const { data, error } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('id', roadmapId)
    .single();

  if (error) throw error;
  return data;
}

export async function getRoadmapsByUser(userId) {
  const { data, error } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getNodesByRoadmap(roadmapId) {
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('roadmap_id', roadmapId)
    .order('sequence_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getNodeById(nodeId) {
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('id', nodeId)
    .single();

  if (error) throw error;
  return data;
}

export async function insertNodes(roadmapId, nodesArray) {
  const rows = nodesArray.map((node, index) => ({
    roadmap_id: roadmapId,
    parent_node_id: node.parentNodeId || null,
    title: node.title,
    summary: node.summary,
    estimated_minutes: node.estimatedMinutes || 15,
    sequence_order: index + 1,
    status: node.status || 'locked',
    remediation_depth: node.remediationDepth || 0,
  }));

  const { data, error } = await supabase.from('nodes').insert(rows).select();
  if (error) throw error;
  return data;
}

export async function createRemediationNode({ roadmapId, parentNodeId, title, summary, estimatedMinutes, remediationDepth }) {
  const { data: latestNode, error: latestError } = await supabase
    .from('nodes')
    .select('sequence_order')
    .eq('roadmap_id', roadmapId)
    .order('sequence_order', { ascending: false })
    .limit(1)
    .single();

  if (latestError) throw latestError;

  const nextOrder = (latestNode?.sequence_order || 0) + 1;
  const { data, error } = await supabase
    .from('nodes')
    .insert({
      roadmap_id: roadmapId,
      parent_node_id: parentNodeId || null,
      title,
      summary,
      estimated_minutes: estimatedMinutes,
      sequence_order: nextOrder,
      status: 'locked',
      remediation_depth: remediationDepth,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNodeStatus(nodeId, updates) {
  const { data, error } = await supabase
    .from('nodes')
    .update(updates)
    .eq('id', nodeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function insertActiveRecallLog({ userId, userEmail, nodeId, quizScore, aiFeedback }) {
  await ensureUserRecord({ id: userId, email: userEmail });

  const { data, error } = await supabase
    .from('active_recall_logs')
    .insert({
      user_id: userId,
      node_id: nodeId,
      quiz_score: quizScore,
      ai_feedback: aiFeedback,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveStellarHash(roadmapId, stellarHash) {
  const { data, error } = await supabase
    .from('roadmaps')
    .update({ stellar_tx_hash: stellarHash })
    .eq('id', roadmapId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
