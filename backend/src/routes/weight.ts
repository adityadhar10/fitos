import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { weightController } from '../controllers/weightController.js';

const router = Router();

// ── Zod schemas ──────────────────────────────────────────────────────────────
export const addWeightSchema = z.object({
  weight: z.coerce
    .number()
    .positive('Weight must be a positive number')
    .max(500, 'Weight value seems too high'),
});

// ── Routes ───────────────────────────────────────────────────────────────────
router.get('/', requireAuth, weightController.getWeightHistory);
router.post('/', requireAuth, validate(addWeightSchema), weightController.addWeightEntry);

export default router;
