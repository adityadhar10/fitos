import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: req.userId },
      include: { sets: true },
      orderBy: { date: 'desc' },
      take: 20,
    });

    res.json({ workouts });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to fetch workouts.' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, sets } = req.body;

    if (!name || !Array.isArray(sets) || sets.length === 0) {
      return res.status(400).json({ error: 'Name and at least one set are required.' });
    }

    const workout = await prisma.workout.create({
      data: {
        userId: req.userId!,
        name,
        sets: {
          create: sets.map((s: { reps: number; weight: number }) => ({
            reps: Number(s.reps),
            weight: Number(s.weight),
          })),
        },
      },
      include: { sets: true },
    });

    res.status(201).json({ workout });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Failed to create workout.' });
  }
});

export default router;
