import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const [meals, workouts, weightEntries, metric] = await Promise.all([
      prisma.meal.findMany({ where: { userId: req.userId, createdAt: { gte: startOfDay } } }),
      prisma.workout.findMany({
        where: { userId: req.userId, date: { gte: startOfDay } },
        include: { sets: true },
      }),
      prisma.weightEntry.findMany({ where: { userId: req.userId }, orderBy: { date: 'desc' }, take: 2 }),
      prisma.dailyMetric.findFirst({ where: { userId: req.userId, date: { gte: startOfDay } } }),
    ]);
const totalCalories = meals.reduce((sum: number, m: { calories: number }) => sum + m.calories, 0);
    const totalProtein = meals.reduce((sum: number, m: { protein: number }) => sum + m.protein, 0);
    const totalCarbs = meals.reduce((sum: number, m: { carbs: number }) => sum + m.carbs, 0);
    const totalFats = meals.reduce((sum: number, m: { fats: number }) => sum + m.fats, 0);
    const steps = metric?.steps || 0;
    const sleepHours = metric?.sleepHours || 0;

    const weightTrend =
      weightEntries.length === 2
        ? `Weight changed from ${weightEntries[1].weight}kg to ${weightEntries[0].weight}kg most recently.`
        : weightEntries.length === 1
        ? `Current weight logged: ${weightEntries[0].weight}kg.`
        : 'No weight data logged yet.';

    const workoutSummary =
      workouts.length > 0
? workouts.map((w: { name: string; sets: unknown[] }) => `${w.name} (${w.sets.length} sets)`).join(', ')        : 'No workout logged today.';

    const prompt = `You are a friendly, encouraging fitness coach AI inside an app called FitOS. Based on the following real data for today, write ONE short, specific, personalized insight (2-3 sentences max, no headers, no bullet points, plain text only). Be warm but concise, and reference actual numbers where relevant.

User: ${user.name}
Today's calories: ${totalCalories} / ${user.calorieGoal} kcal goal
Today's protein: ${totalProtein}g / ${user.proteinGoal}g goal
Today's carbs: ${totalCarbs}g / ${user.carbGoal}g goal
Today's fats: ${totalFats}g / ${user.fatGoal}g goal
Today's steps: ${steps}
Today's sleep: ${sleepHours} hours
Today's workouts: ${workoutSummary}
${weightTrend}

Write the insight now:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent(prompt);
    const insight = result.response.text().trim();

    res.json({ insight });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ error: 'Failed to generate insight.' });
  }
});

export default router;
