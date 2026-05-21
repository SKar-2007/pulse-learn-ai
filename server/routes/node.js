import express from 'express';
import authMiddleware from '../middleware/auth.js';
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

router.post('/verify', async (req, res) => {
  try {
    const { nodeId, userAnswer, expectedSummary, roadmapId } = req.body;
    if (!nodeId || !userAnswer || !expectedSummary || !roadmapId) {
      return res.status(400).json({ error: 'nodeId, roadmapId, userAnswer, and expectedSummary are required.' });
    }

    const roadmap = await getRoadmapById(roadmapId);
    if (roadmap.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied for this roadmap.' });
    }

    const node = await getNodeById(nodeId);
    if (!node) {
      return res.status(404).json({ error: 'Node not found.' });
    }
    if (node.roadmap_id !== roadmapId) {
      return res.status(403).json({ error: 'Node does not belong to the requested roadmap.' });
    }

    const { score, feedback } = await verifyNodeAnswer({ userAnswer, expectedSummary });
    const status = score >= 0.7 ? 'completed' : 'unlocked';
    const updatedNode = await updateNodeStatus(nodeId, { status });

    await insertActiveRecallLog({
      userId: req.user.id,
      userEmail: req.user.email,
      nodeId,
      quizScore: score,
      aiFeedback: feedback,
    });

    if (score < 0.7) {
        roadmapId,
        parentNodeId: nodeId,
        title: `Remediation: ${expectedSummary.slice(0, 50)}`,
        summary: `Review and strengthen this concept: ${expectedSummary}`,
        estimatedMinutes: 15,
        remediationDepth: 1,
      });
    }

    res.json({ node: updatedNode, score, feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
