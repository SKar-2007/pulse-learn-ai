import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { generateQuizQuestions, evaluateAnswers } from '../services/geminiService.js';
import {
  markNodeCompleted,
  unlockNextNode,
  insertActiveRecallLog,
  createRemediationNode,
  getRoadmapById,
  getNodeById,
} from '../services/supabaseService.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.use(requireAuth);

router.post(
  '/quiz',
  asyncHandler(async (req, res) => {
    const { nodeId } = req.body;
    if (!nodeId) throw new HttpError('nodeId is required.', 400);

    const node = await getNodeById(nodeId);
    if (!node) throw new HttpError('Node not found.', 404);

    // Fetch user profile for personalized questions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    const questions = await generateQuizQuestions(node.title, node.summary, profile);
    res.json({ questions });
  })
);

router.post(
  '/verify',
  asyncHandler(async (req, res) => {
    const { nodeId, roadmapId, userAnswers, userAnswer } = req.body;
    if (!nodeId || !roadmapId || (!userAnswers && !userAnswer)) {
      throw new HttpError('Missing required fields.', 400);
    }

    // Role check for viewers
    const { data: membership } = await supabase
      .from('roadmap_collaborators')
      .select('role')
      .eq('roadmap_id', roadmapId)
      .eq('user_id', req.user.id)
      .single();

    const { data: roadmap } = await supabase
      .from('roadmaps')
      .select('owner_id')
      .eq('id', roadmapId)
      .single();

    if (!roadmap) throw new HttpError('Roadmap not found.', 404);
    if (roadmap.owner_id !== req.user.id && (!membership || membership.role === 'viewer')) {
      throw new HttpError('Access denied or view-only.', 403);
    }

    const node = await getNodeById(nodeId);
    if (!node) throw new HttpError('Node not found.', 404);

    // Fetch user profile for personalized evaluation
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    const answers = userAnswers || [{ q_id: 1, answer: userAnswer }];
    const evaluation = await evaluateAnswers(node.title, node.summary, answers, profile);

    let updatedNode = null;
    if (evaluation.passed) {
      updatedNode = await markNodeCompleted(nodeId);
      // Unlock next node automatically
      await unlockNextNode(roadmapId, node.sequence_order);
    }

    await insertActiveRecallLog({
      userId: req.user.id,
      userEmail: req.user.email,
      nodeId,
      quizScore: evaluation.score,
      aiFeedback: evaluation.feedback,
    });

    let remediationNode = null;
    if (!evaluation.passed && node.remediation_depth < 2) {
      remediationNode = await createRemediationNode({
        roadmapId,
        parentNodeId: nodeId,
        title: evaluation.remediation_node?.title || `Remediation: ${node.title}`,
        summary: evaluation.remediation_node?.summary || `Review the topic: ${node.summary}`,
        estimatedMinutes: evaluation.remediation_node?.estimated_minutes || 15,
        remediationDepth: node.remediation_depth + 1,
      });
    }

    res.json({
      passed: evaluation.passed,
      score: evaluation.score,
      feedback: evaluation.feedback,
      mutation_triggered: !!remediationNode,
      new_remediation_node: remediationNode,
      node: updatedNode,
    });
  })
);

export default router;
