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

// ── GET /api/workouts/prs ────────────────────────────────────────────────────
router.get('/prs', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: req.userId },
      include: { sets: true },
      orderBy: { date: 'desc' },
    });

    const prMap = new Map<string, {
      name: string;
      maxWeight: number;
      repsAtMaxWeight: number;
      bestEstimated1RM: number;
      maxSessionVolume: number;
      lastDate: string;
    }>();

    for (const w of workouts) {
      const exerciseKey = w.name.trim().toLowerCase();
      let sessionVolume = 0;
      let sessionMaxWeight = 0;
      let sessionMaxReps = 0;
      let sessionBest1RM = 0;

      for (const s of w.sets) {
        sessionVolume += s.reps * s.weight;
        if (s.weight > sessionMaxWeight) {
          sessionMaxWeight = s.weight;
          sessionMaxReps = s.reps;
        }
        // Epley 1RM formula
        const est1RM = s.reps === 1 ? s.weight : Math.round(s.weight * (1 + s.reps / 30));
        if (est1RM > sessionBest1RM) {
          sessionBest1RM = est1RM;
        }
      }

      if (!prMap.has(exerciseKey)) {
        prMap.set(exerciseKey, {
          name: w.name,
          maxWeight: sessionMaxWeight,
          repsAtMaxWeight: sessionMaxReps,
          bestEstimated1RM: sessionBest1RM,
          maxSessionVolume: sessionVolume,
          lastDate: w.date.toISOString(),
        });
      } else {
        const existing = prMap.get(exerciseKey)!;
        if (sessionMaxWeight > existing.maxWeight) {
          existing.maxWeight = sessionMaxWeight;
          existing.repsAtMaxWeight = sessionMaxReps;
        }
        if (sessionBest1RM > existing.bestEstimated1RM) {
          existing.bestEstimated1RM = sessionBest1RM;
        }
        if (sessionVolume > existing.maxSessionVolume) {
          existing.maxSessionVolume = sessionVolume;
        }
      }
    }

    const prs = Array.from(prMap.values()).sort((a, b) => b.maxWeight - a.maxWeight);

    // Compute muscle recovery status
    const standardMuscles = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
    const now = Date.now();
    const muscleRecovery = standardMuscles.map((muscle) => {
      const lastTrained = workouts.find((w) =>
        (w.muscleGroup && w.muscleGroup.toLowerCase().includes(muscle.toLowerCase())) ||
        w.name.toLowerCase().includes(muscle.toLowerCase())
      );

      if (!lastTrained) {
        return { muscle, status: 'Fresh', score: 100, hoursAgo: null, label: '🟢 Fresh (Ready)' };
      }

      const diffHours = Math.round((now - new Date(lastTrained.date).getTime()) / (1000 * 60 * 60));
      if (diffHours < 24) {
        return { muscle, status: 'Fatigued', score: 35, hoursAgo: diffHours, label: '🔴 Fatigued (Rest)' };
      } else if (diffHours < 48) {
        return { muscle, status: 'Recovering', score: 70, hoursAgo: diffHours, label: '🟡 Recovering' };
      } else {
        return { muscle, status: 'Fresh', score: 100, hoursAgo: diffHours, label: '🟢 Fresh (Ready)' };
      }
    });

    res.json({ prs, muscleRecovery });
  } catch (error) {
    console.error('Get PRs error:', error);
    res.status(500).json({ error: 'Failed to fetch PRs.' });
  }
});

// ── GET /api/workouts/suggestions ─────────────────────────────────────────────
// Progressive overload suggestions: for each exercise, analyze the most recent
// session and recommend a specific target for the next session.
router.get('/suggestions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: req.userId },
      include: { sets: true },
      orderBy: { date: 'desc' },
    });

    const latestByExercise = new Map<string, typeof workouts[0]>();
    for (const w of workouts) {
      const key = w.name.trim().toLowerCase();
      if (!latestByExercise.has(key)) {
        latestByExercise.set(key, w);
      }
    }

    const TARGET_REPS_TOP = 10;
    const TARGET_REPS_BOTTOM = 6;
    const WEIGHT_INCREMENT_PCT = 0.025; // ~2.5%

    const suggestions = Array.from(latestByExercise.values())
      .filter((w) => w.sets.length > 0)
      .map((w) => {
        const avgReps =
          w.sets.reduce((sum, s) => sum + s.reps, 0) / w.sets.length;
        const topWeight = Math.max(...w.sets.map((s) => s.weight));
        const lastSetAtTopWeight = w.sets
          .filter((s) => s.weight === topWeight)
          .sort((a, b) => b.reps - a.reps)[0];

        let recommendation: string;
        let suggestedWeight = topWeight;
        let suggestedReps = lastSetAtTopWeight.reps;

        if (avgReps >= TARGET_REPS_TOP) {
          // Consistently hitting the top of the rep range -> increase weight
          suggestedWeight = Math.round(topWeight * (1 + WEIGHT_INCREMENT_PCT) * 2) / 2; // round to nearest 0.5
          suggestedReps = TARGET_REPS_BOTTOM;
          recommendation = `You hit ${avgReps.toFixed(1)} avg reps at ${topWeight}kg last time. Time to add weight — try ${suggestedWeight}kg for ${suggestedReps} reps.`;
        } else if (avgReps < TARGET_REPS_BOTTOM) {
          // Struggling at current weight -> repeat and build reps
          suggestedWeight = topWeight;
          suggestedReps = lastSetAtTopWeight.reps + 1;
          recommendation = `Reps were a bit low last session (${avgReps.toFixed(1)} avg). Stay at ${topWeight}kg and aim for ${suggestedReps} reps this time.`;
        } else {
          // In the target range -> small linear progression
          suggestedReps = lastSetAtTopWeight.reps + 1;
          recommendation = `Solid session at ${topWeight}kg. Try ${suggestedReps} reps at the same weight before increasing load.`;
        }

        return {
          exercise: w.name,
          lastSessionDate: w.date.toISOString(),
          lastTopWeight: topWeight,
          lastAvgReps: Math.round(avgReps * 10) / 10,
          suggestedWeight,
          suggestedReps,
          recommendation,
        };
      })
      .sort((a, b) => new Date(b.lastSessionDate).getTime() - new Date(a.lastSessionDate).getTime());

    res.json({ suggestions });
  } catch (error) {
    console.error('Get workout suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch workout suggestions.' });
  }
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
