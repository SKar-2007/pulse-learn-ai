import express from 'express';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { verifyNodeAnswer } from '../services/geminiService.js';
import {
  updateNodeStatus,
  insertActiveRecallLog,
  createRemediationNode,
  getRoadmapById,
  getNodeById,
} from '../services/supabaseService.js';

const router = express.Router();
router.use(authMiddleware);

router.post(
  '/verify',
  asyncHandler(async (req, res) => {
    const { nodeId, userAnswer, expectedSummary, roadmapId } = req.body;
    if (!nodeId || !userAnswer || !expectedSummary || !roadmapId) {
      throw new HttpError('nodeId, roadmapId, userAnswer, and expectedSummary are required.', 400, 'bad_request');
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

    const { score, feedback } = await verifyNodeAnswer({ userAnswer, expectedSummary });
    const status = score >= 0.7 ? 'completed' : 'unlocked';
    const updatedNode = await updateNodeStatus(nodeId, { status, completed_at: score >= 0.7 ? new Date().toISOString() : null });

    await insertActiveRecallLog({
      userId: req.user.id,
      userEmail: req.user.email,
      nodeId,
      quizScore: score,
      aiFeedback: feedback,
    });

    if (score < 0.7) {
      await createRemediationNode({
        roadmapId,
        parentNodeId: nodeId,
        title: `Remediation: ${expectedSummary.slice(0, 50)}`,
        summary: `Review and strengthen this concept: ${expectedSummary}`,
        estimatedMinutes: 15,
        remediationDepth: 1,
      });
    }

    res.json({ node: updatedNode, score, feedback });
  })
);

export default router;
