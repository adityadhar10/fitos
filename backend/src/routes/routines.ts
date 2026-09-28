import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { routineController } from '../controllers/routineController.js';

const router = Router();

const generateRoutineSchema = z.object({
  goal: z.enum(['hypertrophy', 'strength', 'fat_loss', 'endurance', 'general_fitness']),
  daysPerWeek: z.number().int().min(2).max(6),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  equipment: z.enum(['commercial_gym', 'home_dumbbells', 'bodyweight_calisthenics', 'barbell_only']),
  focusArea: z.string().optional(),
});

// ── GET /api/routines/templates ──────────────────────────────────────────────
router.get('/templates', requireAuth, routineController.getTemplates);

// ── POST /api/routines/generate ──────────────────────────────────────────────
router.post('/generate', requireAuth, validate(generateRoutineSchema), routineController.generateRoutine);

export default router;
