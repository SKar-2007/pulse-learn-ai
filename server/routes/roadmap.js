import express from 'express';
import pdfParse from 'pdf-parse';
import upload from '../middleware/upload.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import {
  createRoadmap,
  getRoadmapById,
  getRoadmapsByUser,
  getRoadmapDetails,
  getNodesByRoadmap,
  insertNodes,
  saveStellarHash,
} from '../services/supabaseService.js';
import { generateRoadmapFromText } from '../services/geminiService.js';
import { mintCredentialReceipt, verifyStellarReceipt } from '../services/stellarService.js';

const router = express.Router();
router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const roadmaps = await getRoadmapsByUser(req.user.id);
    res.json({ roadmaps });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const roadmap = await getRoadmapDetails(req.params.id);
    if (!roadmap) {
      throw new HttpError('Roadmap not found.', 404, 'roadmap_not_found');
    }
    if (roadmap.user_id !== req.user.id) {
      throw new HttpError('Access denied for this roadmap.', 403, 'access_denied');
    }
    res.json({ roadmap });
  })
);

router.get(
  '/:id/nodes',
  asyncHandler(async (req, res) => {
    const roadmap = await getRoadmapById(req.params.id);
    if (!roadmap) {
      throw new HttpError('Roadmap not found.', 404, 'roadmap_not_found');
    }
    if (roadmap.user_id !== req.user.id) {
      throw new HttpError('Access denied for this roadmap.', 403, 'access_denied');
    }
    const nodes = await getNodesByRoadmap(req.params.id);
    res.json({ nodes });
  })
);

router.post(
  '/generate',
  upload.single('syllabus'),
  asyncHandler(async (req, res) => {
    const { title, timeBudgetHours, targetDate, text } = req.body;
    let syllabusText = text;

    if (req.file) {
      const pdfResult = await pdfParse(req.file.buffer);
      syllabusText = pdfResult.text;
    }

    if (!title || !timeBudgetHours || !syllabusText) {
      throw new HttpError('Missing required fields or syllabus upload.', 400, 'bad_request');
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
  })
);

router.post(
  '/mint',
  asyncHandler(async (req, res) => {
    const { roadmapId, walletSecret } = req.body;
    if (!roadmapId) {
      throw new HttpError('roadmapId is required.', 400, 'bad_request');
    }

    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new HttpError('Roadmap not found.', 404, 'roadmap_not_found');
    }
    if (roadmap.user_id !== req.user.id) {
      throw new HttpError('Access denied for this roadmap.', 403, 'access_denied');
    }

    const txHash = await mintCredentialReceipt({
      walletSecret,
      credentialData: { roadmapId, mintedAt: new Date().toISOString() },
    });

    await saveStellarHash(roadmapId, txHash);
    res.json({ txHash });
  })
);

router.get(
  '/:id/receipt',
  asyncHandler(async (req, res) => {
    const roadmap = await getRoadmapById(req.params.id);
    if (!roadmap) {
      throw new HttpError('Roadmap not found.', 404, 'roadmap_not_found');
    }
    if (roadmap.user_id !== req.user.id) {
      throw new HttpError('Access denied for this roadmap.', 403, 'access_denied');
    }

    if (!roadmap.stellar_tx_hash) {
      throw new HttpError('No Stellar receipt found for this roadmap.', 404, 'receipt_not_found');
    }

    const verifyOnChain = req.query.verify === 'true' || req.query.verify === '1';
    const response = { txHash: roadmap.stellar_tx_hash };

    if (verifyOnChain) {
      response.receipt = await verifyStellarReceipt(roadmap.stellar_tx_hash);
    }

    res.json(response);
  })
);

export default router;
