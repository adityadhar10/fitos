import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { metricController } from '../controllers/metricController.js';

const router = Router();

// ── Zod schemas ──────────────────────────────────────────────────────────────
export const updateMetricsSchema = z.object({
  steps: z.coerce.number().int().nonnegative().optional(),
  sleepHours: z.coerce.number().min(0).max(24, 'Sleep hours cannot exceed 24').optional(),
  waterMl: z.coerce.number().int().nonnegative().max(10000, 'Water intake cannot exceed 10000ml').optional(),
}).refine((data) => data.steps !== undefined || data.sleepHours !== undefined || data.waterMl !== undefined, {
  message: 'At least one metric (steps, sleepHours, or waterMl) must be provided.',
});

// ── Routes ───────────────────────────────────────────────────────────────────

router.get('/today', requireAuth, metricController.getTodayMetrics);
router.post('/today', requireAuth, validate(updateMetricsSchema), metricController.updateTodayMetrics);
router.get('/weekly', requireAuth, metricController.getWeeklyMetrics);
router.get('/streak', requireAuth, metricController.getStreak);

export default router;
