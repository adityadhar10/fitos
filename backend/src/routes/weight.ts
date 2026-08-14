import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

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

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { weight } = req.body;

    if (weight === undefined) {
      return res.status(400).json({ error: 'Weight is required.' });
    }

    const entry = await prisma.weightEntry.create({
      data: { userId: req.userId!, weight: Number(weight) },
    });

    res.status(201).json({ entry });
  } catch (error) {
    console.error('Create weight entry error:', error);
    res.status(500).json({ error: 'Failed to log weight.' });
  }
});

export default router;
