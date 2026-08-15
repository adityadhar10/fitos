import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

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

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
const { type, description, calories, protein, carbs, fats } = req.body;

    if (!type || !description || calories === undefined) {
      return res.status(400).json({ error: 'Type, description, and calories are required.' });
    }

    const meal = await prisma.meal.create({
      data: {
        userId: req.userId!,
        type,
        description,
        calories: Number(calories),
        protein: protein !== undefined ? Number(protein) : 0,
        carbs: carbs !== undefined ? Number(carbs) : 0,
        fats: fats !== undefined ? Number(fats) : 0,
      },
    });
    res.status(201).json({ meal });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Failed to create meal.' });
  }
});
    router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const mealId = String(req.params.id);
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
