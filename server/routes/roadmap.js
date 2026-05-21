import express from 'express';
import pdfParse from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';
import upload from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';
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
import { mintCredentialReceipt } from '../services/stellarService.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const router = express.Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    // In v2, users can see their own roadmaps AND those they collaborate on
    const { data: collabRoadmaps } = await supabase
      .from('roadmap_collaborators')
      .select('roadmap_id')
      .eq('user_id', req.user.id);

    const collabIds = collabRoadmaps?.map(c => c.roadmap_id) || [];

    const { data: roadmaps, error } = await supabase
      .from('roadmaps')
      .select('*')
      .or(`owner_id.eq.${req.user.id},id.in.(${collabIds.length ? collabIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ roadmaps });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    // Access check included in getRoadmapDetails/Supabase RLS implicitly, 
    // but we'll do an explicit check for safety
    const { data: access } = await supabase
      .from('roadmaps')
      .select('owner_id, id')
      .eq('id', req.params.id)
      .single();

    if (!access) throw new HttpError('Roadmap not found.', 404);

    const { data: collab } = await supabase
      .from('roadmap_collaborators')
      .select('role')
      .eq('roadmap_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (access.owner_id !== req.user.id && !collab) {
      throw new HttpError('Access denied.', 403);
    }

    const roadmap = await getRoadmapDetails(req.params.id);
    res.json({ roadmap });
  })
);

router.post(
  '/generate',
  upload.single('syllabus'),
  asyncHandler(async (req, res) => {
    const { title, timeBudgetHours, targetDate, text, workspaceNotes } = req.body;
    let syllabusText = text;

    if (req.file) {
      const pdfResult = await pdfParse(req.file.buffer);
      syllabusText = pdfResult.text;
    }

    if (!title || !timeBudgetHours || !syllabusText) {
      throw new HttpError('Missing required fields or syllabus upload.', 400);
    }

    // Fetch user profile for personalization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    const roadmapData = await createRoadmap({
      userId: req.user.id,
      userEmail: req.user.email,
      title,
      timeBudgetHours: parseInt(timeBudgetHours, 10),
      targetDate: targetDate || null,
    });

    const { nodes } = await generateRoadmapFromText(syllabusText, parseInt(timeBudgetHours, 10), profile, workspaceNotes);
    await insertNodes(roadmapData.id, nodes);

    const fullRoadmap = await getRoadmapDetails(roadmapData.id);
    res.json({ roadmap: fullRoadmap });
  })
);

router.post(
  '/:id/complete',
  asyncHandler(async (req, res) => {
    // Ported from v1 but with requiredAuth
    const { finalScore, walletSecret } = req.body;
    const roadmap = await getRoadmapById(req.params.id);
    if (!roadmap) throw new HttpError('Roadmap not found.', 404);
    if (roadmap.owner_id !== req.user.id) throw new HttpError('Access denied.', 403);

    const txHash = await mintCredentialReceipt({
      walletSecret,
      credentialData: { roadmapId: roadmap.id, title: roadmap.title, finalScore, mintedAt: new Date().toISOString() },
    });

    if (txHash) await saveStellarHash(roadmap.id, txHash);
    res.json({ success: true, stellar_tx_hash: txHash });
  })
);

export default router;
