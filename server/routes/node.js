import express from 'express';
import authMiddleware from '../middleware/auth.js';
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

const router = express.Router();
router.use(authMiddleware);

router.post(
  '/quiz',
  asyncHandler(async (req, res) => {
    const { nodeId } = req.body;
    if (!nodeId) {
      throw new HttpError('nodeId is required.', 400, 'bad_request');
    }

    const node = await getNodeById(nodeId);
    if (!node) {
      throw new HttpError('Node not found.', 404, 'node_not_found');
    }

    const questions = await generateQuizQuestions(node.title, node.summary);
    res.json({ questions });
  })
);

router.post(
  '/verify',
  asyncHandler(async (req, res) => {
    const { nodeId, roadmapId, userAnswers, userAnswer } = req.body;
    if (!nodeId || !roadmapId || (!userAnswers && !userAnswer)) {
      throw new HttpError('nodeId, roadmapId and userAnswers or userAnswer are required.', 400, 'bad_request');
    }

    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new HttpError('Roadmap not found.', 404, 'roadmap_not_found');
    }
    if (roadmap.user_id !== req.user.id) {
      throw new HttpError('Access denied for this roadmap.', 403, 'access_denied');
    }

    const node = await getNodeById(nodeId);
    if (!node) {
      throw new HttpError('Node not found.', 404, 'node_not_found');
    }
    if (node.roadmap_id !== roadmapId) {
      throw new HttpError('Node does not belong to the requested roadmap.', 403, 'node_mismatch');
    }

    const answers = userAnswers || [{ q_id: 1, answer: userAnswer }];
    const evaluation = await evaluateAnswers(node.title, node.summary, answers);

    let updatedNode = null;
    if (evaluation.passed) {
      updatedNode = await markNodeCompleted(nodeId);
    } else {
      updatedNode = await unlockNextNode(roadmapId, node.sequence_order);
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
        title: `Remediation: ${node.title}`,
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
