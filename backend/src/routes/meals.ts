import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ── Zod schemas ──────────────────────────────────────────────────────────────
const addMealSchema = z.object({
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

// ── GET /api/meals ───────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const meals = await prisma.meal.findMany({
      where: { userId: req.userId, createdAt: { gte: startOfDay } },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ meals });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Failed to fetch meals.' });
  }
});

// ── POST /api/meals ──────────────────────────────────────────────────────────
router.post('/', requireAuth, validate(addMealSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { type, description, calories, protein, carbs, fats } = req.body;

    const meal = await prisma.meal.create({
      data: { userId: req.userId!, type, description, calories, protein, carbs, fats },
    });
    res.status(201).json({ meal });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Failed to create meal.' });
  }
});

// ── DELETE /api/meals/:id ────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const mealId = req.params.id as string;
    const meal = await prisma.meal.findUnique({ where: { id: mealId } });

    if (!meal || meal.userId !== req.userId) {
      return res.status(404).json({ error: 'Meal not found.' });
    }

    await prisma.meal.delete({ where: { id: mealId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal.' });
  }
});

export default router;
