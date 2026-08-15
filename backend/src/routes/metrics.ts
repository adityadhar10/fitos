import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ── Zod schemas ──────────────────────────────────────────────────────────────
const updateMetricsSchema = z.object({
  steps: z.coerce.number().int().nonnegative().optional(),
  sleepHours: z.coerce.number().min(0).max(24, 'Sleep hours cannot exceed 24').optional(),
}).refine((data) => data.steps !== undefined || data.sleepHours !== undefined, {
  message: 'At least one of steps or sleepHours must be provided.',
});

// ── GET /api/metrics/today ───────────────────────────────────────────────────
router.get('/today', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const metric = await prisma.dailyMetric.findFirst({
      where: { userId: req.userId, date: { gte: startOfDay } },
    });

    res.json({ metric: metric || { steps: 0, sleepHours: 0 } });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics.' });
  }
});

// ── POST /api/metrics/today ──────────────────────────────────────────────────
router.post('/today', requireAuth, validate(updateMetricsSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { steps, sleepHours } = req.body;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await prisma.dailyMetric.findFirst({
      where: { userId: req.userId, date: { gte: startOfDay } },
    });

    let metric;
    if (existing) {
      metric = await prisma.dailyMetric.update({
        where: { id: existing.id },
        data: {
          steps: steps !== undefined ? steps : existing.steps,
          sleepHours: sleepHours !== undefined ? sleepHours : existing.sleepHours,
        },
      });
    } else {
      metric = await prisma.dailyMetric.create({
        data: {
          userId: req.userId!,
          steps: steps ?? 0,
          sleepHours: sleepHours ?? 0,
        },
      });
    }

    res.json({ metric });
  } catch (error) {
    console.error('Update metrics error:', error);
    res.status(500).json({ error: 'Failed to update metrics.' });
  }
});

// ── GET /api/metrics/weekly ──────────────────────────────────────────────────
router.get('/weekly', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const metrics = await prisma.dailyMetric.findMany({
      where: { userId: req.userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' },
    });

    res.json({ metrics });
  } catch (error) {
    console.error('Get weekly metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly metrics.' });
  }
});

// ── GET /api/metrics/streak ──────────────────────────────────────────────────
router.get('/streak', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    sixtyDaysAgo.setHours(0, 0, 0, 0);

    const [metrics, meals] = await Promise.all([
      prisma.dailyMetric.findMany({
        where: { userId: req.userId, date: { gte: sixtyDaysAgo }, steps: { gt: 0 } },
        select: { date: true },
        orderBy: { date: 'desc' },
      }),
      prisma.meal.findMany({
        where: { userId: req.userId, createdAt: { gte: sixtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const activeDays = new Set<string>();
    for (const m of metrics) activeDays.add(new Date(m.date).toDateString());
    for (const m of meals) activeDays.add(new Date(m.createdAt).toDateString());

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (activeDays.has(d.toDateString())) {
        streak++;
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to fetch streak.' });
  }
});

export default router;
