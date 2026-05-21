import express from 'express';
import pdfParse from 'pdf-parse';
import upload from '../middleware/upload.js';
import authMiddleware from '../middleware/auth.js';
import {
  createRoadmap,
  getRoadmapById,
  getRoadmapsByUser,
  getNodesByRoadmap,
  insertNodes,
  saveStellarHash,
} from '../services/supabaseService.js';
import { generateRoadmapFromText } from '../services/geminiService.js';
import { mintCredentialReceipt } from '../services/stellarService.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const roadmaps = await getRoadmapsByUser(req.user.id);
    res.json({ roadmaps });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const roadmap = await getRoadmapById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found.' });
    }
    if (roadmap.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied for this roadmap.' });
    }
    const nodes = await getNodesByRoadmap(req.params.id);
    res.json({ roadmap, nodes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/nodes', async (req, res) => {
  try {
    const roadmap = await getRoadmapById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found.' });
    }
    if (roadmap.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied for this roadmap.' });
    }
    const nodes = await getNodesByRoadmap(req.params.id);
    res.json({ nodes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', upload.single('syllabus'), async (req, res) => {
  try {
    const { title, timeBudgetHours, targetDate, text } = req.body;
    let syllabusText = text;

    if (req.file) {
      const pdfResult = await pdfParse(req.file.buffer);
      syllabusText = pdfResult.text;
    }

    if (!title || !timeBudgetHours || !syllabusText) {
      return res.status(400).json({ error: 'Missing required fields or syllabus upload.' });
    }

    const roadmap = await createRoadmap({
      userId: req.user.id,
      userEmail: req.user.email,
      title,
      timeBudgetHours: parseInt(timeBudgetHours, 10),
      targetDate: targetDate || null,
    });

    const nodes = await generateRoadmapFromText(syllabusText);
    const insertedNodes = await insertNodes(roadmap.id, nodes);

    res.json({ roadmap, nodes: insertedNodes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mint', async (req, res) => {
  try {
    const { roadmapId, walletSecret } = req.body;
    if (!roadmapId) {
      return res.status(400).json({ error: 'roadmapId is required.' });
    }

    const roadmap = await getRoadmapById(roadmapId);
    if (roadmap.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied for this roadmap.' });
    }

    const txHash = await mintCredentialReceipt({
      walletSecret,
      credentialData: { roadmapId, mintedAt: new Date().toISOString() },
    });

    await saveStellarHash(roadmapId, txHash);
    res.json({ txHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
