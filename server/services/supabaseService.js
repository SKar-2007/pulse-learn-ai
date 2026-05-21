import { createClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError.js';
import { normalizeNumber } from '../utils/validators.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function handleSupabaseError(error, message = 'Supabase query failed') {
  if (!error) {
    throw new HttpError(message, 502, 'supabase_error');
  }
  throw new HttpError(error.message || message, 502, error.code || 'supabase_error');
}

export async function getUserFromAccessToken(accessToken) {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) throw handleSupabaseError(error, 'Unable to validate auth token');
  if (!data?.user) throw new HttpError('Invalid auth token', 401, 'invalid_auth_token');
  return data.user;
}

export async function ensureUserRecord(user) {
  if (!user?.id) throw new HttpError('Missing user id', 400, 'missing_user_id');
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: user.id, email: user.email }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw handleSupabaseError(error, 'Unable to ensure user record');
  return data;
}

export async function createRoadmap({ userId, userEmail, title, timeBudgetHours, targetDate }) {
  await ensureUserRecord({ id: userId, email: userEmail });

  const { data, error } = await supabase
    .from('roadmaps')
    .insert({
      owner_id: userId,
      title,
      time_budget_hours: normalizeNumber(timeBudgetHours, 10),
      target_date: targetDate,
    })
    .select()
    .single();

  if (error) throw handleSupabaseError(error, 'Unable to create roadmap');
  return data;
}

export async function getRoadmapById(roadmapId) {
  const { data, error } = await supabase.from('roadmaps').select('*').eq('id', roadmapId).single();
  if (error) throw handleSupabaseError(error, 'Unable to retrieve roadmap');
  return data;
}

export async function getRoadmapDetails(roadmapId) {
  const roadmap = await getRoadmapById(roadmapId);
  if (!roadmap) return null;

  const nodes = await getNodesByRoadmap(roadmapId);
  const totalNodes = nodes.length;
  const completedNodes = nodes.filter((node) => node.status === 'completed').length;

  return {
    ...roadmap,
    nodes,
    total_nodes: totalNodes,
    completed_nodes: completedNodes,
    progress_percent: totalNodes ? Math.round((completedNodes / totalNodes) * 100) : 0,
    next_node: nodes.find((node) => node.status !== 'completed') || null,
  };
}

export async function getRoadmapsByUser(userId) {
  const { data, error } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw handleSupabaseError(error, 'Unable to retrieve roadmaps');
  return data;
}

export async function getNodesByRoadmap(roadmapId) {
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('roadmap_id', roadmapId)
    .order('sequence_order', { ascending: true });

  if (error) throw handleSupabaseError(error, 'Unable to retrieve nodes');
  return data;
}

export async function getNodeById(nodeId) {
  const { data, error } = await supabase.from('nodes').select('*').eq('id', nodeId).single();
  if (error) throw handleSupabaseError(error, 'Unable to retrieve node');
  return data;
}

export async function insertNodes(roadmapId, nodesArray) {
  const rows = nodesArray.map((node, index) => ({
    roadmap_id: roadmapId,
    parent_node_id: node.parentNodeId || null,
    title: node.title,
    summary: node.summary,
    estimated_minutes: normalizeNumber(node.estimated_minutes || node.estimatedMinutes, 15),
    sequence_order: index + 1,
    status: node.status || 'locked',
    remediation_depth: normalizeNumber(node.remediation_depth || node.remediationDepth, 0),
  }));

  const { data, error } = await supabase.from('nodes').insert(rows).select();
  if (error) throw handleSupabaseError(error, 'Unable to insert nodes');
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

  if (latestError) throw handleSupabaseError(latestError, 'Unable to retrieve latest node order');

  const nextOrder = (latestNode?.sequence_order || 0) + 1;
  const { data, error } = await supabase
    .from('nodes')
    .insert({
      roadmap_id: roadmapId,
      parent_node_id: parentNodeId || null,
      title,
      summary,
      estimated_minutes: normalizeNumber(estimatedMinutes, 15),
      sequence_order: nextOrder,
      status: 'remediation',
      remediation_depth: normalizeNumber(remediationDepth, 0),
    })
    .select()
    .single();

  if (error) throw handleSupabaseError(error, 'Unable to create remediation node');
  return data;
}

export async function updateNodeStatus(nodeId, updates) {
  const { data, error } = await supabase
    .from('nodes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', nodeId)
    .select()
    .single();

  if (error) throw handleSupabaseError(error, 'Unable to update node');
  return data;
}

export async function markNodeCompleted(nodeId) {
  return updateNodeStatus(nodeId, { status: 'completed', completed_at: new Date().toISOString() });
}

export async function unlockNextNode(roadmapId, currentOrder) {
  const { data: nextNode, error: nextError } = await supabase
    .from('nodes')
    .select('*')
    .eq('roadmap_id', roadmapId)
    .gt('sequence_order', currentOrder)
    .eq('status', 'locked')
    .order('sequence_order', { ascending: true })
    .limit(1)
    .single();

  if (nextError && nextError.code !== 'PGRST116') {
    throw handleSupabaseError(nextError, 'Unable to retrieve next node');
  }

  if (!nextNode) return null;
  return updateNodeStatus(nextNode.id, { status: 'unlocked' });
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

  if (error) throw handleSupabaseError(error, 'Unable to store active recall log');
  return data;
}

export async function saveStellarHash(roadmapId, stellarHash) {
  const { data, error } = await supabase
    .from('roadmaps')
    .update({ stellar_tx_hash: stellarHash, updated_at: new Date().toISOString() })
    .eq('id', roadmapId)
    .select()
    .single();

  if (error) throw handleSupabaseError(error, 'Unable to save Stellar hash');
  return data;
}
