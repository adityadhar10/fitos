import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Simple rate limiter to prevent hitting Gemini API quota
const rateLimiter = {
  lastCall: 0,
  minInterval: 60000, // 1 minute between API calls
  isRateLimited(): boolean {
    const now = Date.now();
    if (now - this.lastCall < this.minInterval) {
      return true;
    }
    this.lastCall = now;
    return false;
  }
};

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

    let insight = '';
    
    // Check rate limit before attempting API call
    if (rateLimiter.isRateLimited()) {
      console.warn('Rate limit active, using rule-based insight instead of API.');
      const remainingCal = Math.max(0, user.calorieGoal - totalCalories);
      const remainingProt = Math.max(0, user.proteinGoal - totalProtein);
      if (totalCalories === 0 && steps === 0) {
        insight = `Great start to the day, ${user.name}! Ready to fuel up with your first meal and hit your ${user.calorieGoal} kcal target? Let's crush today's goals.`;
      } else if (remainingCal > 0) {
        insight = `Solid effort today, ${user.name}! You're at ${totalCalories} / ${user.calorieGoal} kcal with ${remainingProt}g protein left to reach your daily target. Keep up the momentum!`;
      } else {
        insight = `Outstanding discipline, ${user.name}! You've reached your daily calorie goal and logged ${steps} steps. Fantastic consistency today!`;
      }
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        insight = result.response.text().trim();
      } catch (apiErr: any) {
        console.warn('Gemini API error:', apiErr.message);
        // Check if it's a quota/rate limit error (429)
        const isQuotaError = apiErr.status === 429 || apiErr.message?.includes('quota') || apiErr.message?.includes('rate limit');
        
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
          const result = await model.generateContent(prompt);
          insight = result.response.text().trim();
        } catch (fallbackErr: any) {
          console.warn('Gemini quota reached or API unavailable, using personalized rule-based coach insight.');
          const remainingCal = Math.max(0, user.calorieGoal - totalCalories);
          const remainingProt = Math.max(0, user.proteinGoal - totalProtein);
          if (totalCalories === 0 && steps === 0) {
            insight = `Great start to the day, ${user.name}! Ready to fuel up with your first meal and hit your ${user.calorieGoal} kcal target? Let's crush today's goals.`;
          } else if (remainingCal > 0) {
            insight = `Solid effort today, ${user.name}! You're at ${totalCalories} / ${user.calorieGoal} kcal with ${remainingProt}g protein left to reach your daily target. Keep up the momentum!`;
          } else {
            insight = `Outstanding discipline, ${user.name}! You've reached your daily calorie goal and logged ${steps} steps. Fantastic consistency today!`;
          }
        }
      }
    }

    res.json({ insight });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ error: 'Failed to generate insight.' });
  }
});

export default router;
