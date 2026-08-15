import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ── Zod schemas ──────────────────────────────────────────────────────────────
const addWeightSchema = z.object({
  weight: z.coerce
    .number()
    .positive('Weight must be a positive number')
    .max(500, 'Weight value seems too high'),
});

// ── GET /api/weight ──────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.weightEntry.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'asc' },
    });

    res.json({ entries });
  } catch (error) {
    console.error('Get weight error:', error);
    res.status(500).json({ error: 'Failed to fetch weight history.' });
  }
});

// ── POST /api/weight ─────────────────────────────────────────────────────────
router.post('/', requireAuth, validate(addWeightSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { weight } = req.body;

    const entry = await prisma.weightEntry.create({
      data: { userId: req.userId!, weight },
    });

    res.status(201).json({ entry });
  } catch (error) {
    console.error('Create weight entry error:', error);
    res.status(500).json({ error: 'Failed to log weight.' });
  }
});

export default router;
