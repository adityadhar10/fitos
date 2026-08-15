import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ── Zod schemas ──────────────────────────────────────────────────────────────
const addWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100),
  muscleGroup: z.string().max(50).optional(),
  sets: z
    .array(
      z.object({
        reps: z.coerce.number().int().positive('Reps must be positive'),
        weight: z.coerce.number().nonnegative('Weight must be 0 or more'),
      })
    )
    .min(1, 'At least one set is required'),
});

// ── GET /api/workouts ────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: req.userId },
      include: { sets: true },
      orderBy: { date: 'desc' },
      take: 30,
    });

    res.json({ workouts });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to fetch workouts.' });
  }
});

// ── POST /api/workouts ───────────────────────────────────────────────────────
router.post('/', requireAuth, validate(addWorkoutSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { name, muscleGroup, sets } = req.body;

    const workout = await prisma.workout.create({
      data: {
        userId: req.userId!,
        name,
        muscleGroup: muscleGroup ?? null,
        sets: {
          create: sets.map((s: { reps: number; weight: number }) => ({
            reps: s.reps,
            weight: s.weight,
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

// ── DELETE /api/workouts/:id ─────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const workout = await prisma.workout.findFirst({
      where: { id, userId: req.userId },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found.' });
    }

    await prisma.$transaction([
      prisma.set.deleteMany({ where: { workoutId: id } }),
      prisma.workout.delete({ where: { id } }),
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Failed to delete workout.' });
  }
});

export default router;
