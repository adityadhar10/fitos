import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── GET /api/export/csv — Workout history as CSV ──────────────────────────────
router.get('/csv', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: req.userId },
      include: { sets: true },
      orderBy: { date: 'desc' },
    });

    const rows: string[] = [
      'Date,Exercise,Muscle Group,Sets,Total Reps,Avg Weight (kg)',
    ];

    for (const w of workouts) {
      const date = new Date(w.date).toISOString().split('T')[0];
      const totalReps = w.sets.reduce((s, set) => s + set.reps, 0);
      const avgWeight =
        w.sets.length > 0
          ? (w.sets.reduce((s, set) => s + set.weight, 0) / w.sets.length).toFixed(1)
          : '0';
      rows.push(
        `${date},"${w.name}","${w.muscleGroup ?? 'General'}",${w.sets.length},${totalReps},${avgWeight}`
      );
    }

    const csv = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fitos-workouts.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export workouts.' });
  }
});

// ── GET /api/export/nutrition-csv — Nutrition log as CSV ─────────────────────
router.get('/nutrition-csv', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const meals = await prisma.meal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    const rows: string[] = ['Date,Meal Type,Description,Calories,Protein (g),Carbs (g),Fats (g)'];

    for (const m of meals) {
      const date = new Date(m.createdAt).toISOString().split('T')[0];
      rows.push(
        `${date},"${m.type}","${m.description}",${m.calories},${m.protein},${m.carbs},${m.fats}`
      );
    }

    const csv = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fitos-nutrition.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export nutrition CSV error:', error);
    res.status(500).json({ error: 'Failed to export nutrition log.' });
  }
});

// ── GET /api/export/weight-csv — Weight history as CSV ───────────────────────
router.get('/weight-csv', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.weightEntry.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });

    const rows: string[] = ['Date,Weight (kg)'];
    for (const e of entries) {
      const date = new Date(e.date).toISOString().split('T')[0];
      rows.push(`${date},${e.weight}`);
    }

    const csv = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fitos-weight.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export weight CSV error:', error);
    res.status(500).json({ error: 'Failed to export weight history.' });
  }
});

export default router;
