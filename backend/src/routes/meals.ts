import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mealController } from '../controllers/mealController.js';

const router = Router();

// ── Zod schemas ──────────────────────────────────────────────────────────────
export const addMealSchema = z.object({
  type: z.string().transform((val) => val.toLowerCase()).pipe(
    z.enum(['breakfast', 'lunch', 'dinner', 'snack'] as const, {
      error: () => 'Type must be breakfast, lunch, dinner, or snack.',
    })
  ),
  description: z.string().min(1, 'Description is required').max(200),
  calories: z.coerce.number().int().nonnegative('Calories must be 0 or more'),
  protein: z.coerce.number().int().nonnegative().optional().default(0),
  carbs: z.coerce.number().int().nonnegative().optional().default(0),
  fats: z.coerce.number().int().nonnegative().optional().default(0),
});

// ── Routes ───────────────────────────────────────────────────────────────────

router.get('/', requireAuth, mealController.getTodayMeals);
router.post('/', requireAuth, validate(addMealSchema), mealController.createMeal);
router.delete('/:id', requireAuth, mealController.deleteMeal);

export default router;
