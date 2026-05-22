import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { verifyStellarReceipt } from '../services/stellarService.js';

const router = express.Router();

router.get('/verify/:txHash', requireAuth, async (req, res) => {
  try {
    const result = await verifyStellarReceipt(req.params.txHash);
    res.json(result);
  } catch (error) {
    console.error('[PulseLearn][Stellar] verify error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Stellar verification failed.' });
  }
});

export default router;
