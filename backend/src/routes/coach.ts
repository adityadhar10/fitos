import { Router, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'model']),
        content: z.string(),
      })
    )
    .optional(),
});

// Rate limiter to prevent quota exhaustion
let lastCallTime = 0;
const MIN_CALL_GAP_MS = 2500;

router.post('/chat', requireAuth, validate(chatSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { message, history = [] } = req.body;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch user profile and fitness context
    const [user, meals, workouts, weightEntries, dailyMetric] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.userId } }),
      prisma.meal.findMany({
        where: { userId: req.userId, createdAt: { gte: startOfDay } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.workout.findMany({
        where: { userId: req.userId, date: { gte: sevenDaysAgo } },
        include: { sets: true },
        orderBy: { date: 'desc' },
      }),
      prisma.weightEntry.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.dailyMetric.findFirst({
        where: { userId: req.userId, date: { gte: startOfDay } },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Aggregate today's metrics
    const totalCal = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalProt = meals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);

    const remCal = Math.max(0, user.calorieGoal - totalCal);
    const remProt = Math.max(0, user.proteinGoal - totalProt);
    const steps = dailyMetric?.steps || 0;
    const sleep = dailyMetric?.sleepHours || 0;
    const water = dailyMetric?.waterMl || 0;

    const currentWeight = weightEntries.length > 0 ? `${weightEntries[0].weight} kg` : 'Not logged yet';
    const weightHistorySummary =
      weightEntries.length > 1
        ? weightEntries.map((w) => `${w.weight}kg on ${new Date(w.date).toLocaleDateString()}`).join(' -> ')
        : currentWeight;

    const recentWorkoutsSummary =
      workouts.length > 0
        ? workouts
            .map(
              (w) =>
                `• ${w.name} (${w.muscleGroup || 'General'}): ${w.sets.length} sets, total vol ${w.sets.reduce(
                  (a, b) => a + b.reps * b.weight,
                  0
                )}kg on ${new Date(w.date).toLocaleDateString()}`
            )
            .join('\n')
        : 'No workouts logged in the last 7 days.';

    const systemPrompt = `You are FitOS Coach, an elite, data-driven AI fitness intelligence assistant and personal trainer.
You give actionable, concise, science-backed fitness and nutrition advice tailored precisely to the user's real-time tracked data.

=== USER REAL-TIME HEALTH CONTEXT ===
• Name: ${user.name}
• Daily Goals: ${user.calorieGoal} kcal | ${user.proteinGoal}g Protein | ${user.carbGoal}g Carbs | ${user.fatGoal}g Fats
• Today's Consumed: ${totalCal} kcal | ${totalProt}g Protein | ${totalCarbs}g Carbs | ${totalFats}g Fats
• Remaining Today: ${remCal} kcal | ${remProt}g Protein
• Hydration Today: ${water} ml / 3000 ml
• Activity Today: ${steps} steps
• Sleep Today: ${sleep} hours
• Latest Weight: ${currentWeight}
• Weight History: ${weightHistorySummary}
• Recent Workouts (Last 7 Days):
${recentWorkoutsSummary}

=== COACHING GUIDELINES ===
1. Use the user's exact numbers when giving recommendations (e.g. "You have ${remProt}g of protein left today").
2. When answering "What went wrong?" or plateau questions: analyze caloric balance, protein intake, sleep deficit, and workout frequency systematically.
3. Structure responses with clear bullet points, bold key numbers, and helpful emoji.
4. Keep answers concise, highly practical, and motivating without unnecessary fluff.
5. If suggesting meals, include approximate calories and protein for each suggestion.`;

    let reply = '';
    const now = Date.now();
    const isThrottled = now - lastCallTime < MIN_CALL_GAP_MS;
    lastCallTime = now;

    if (!isThrottled && process.env.GEMINI_API_KEY) {
      try {
        // Format conversational history
        const formattedHistory = history.map((h: { role: string; content: string }) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        }));

        const chat = genAI.chats.create({
          model: 'gemini-3.6-flash',
          history: formattedHistory,
          config: { systemInstruction: systemPrompt },
        });

        const result = await chat.sendMessage({ message });
        reply = (result.text || '').trim();
      } catch (geminiErr: any) {
        console.warn('Gemini Coach error:', geminiErr.message);
      }
    }

    // Intelligent context-grounded fallback if API is throttled or key error
    if (!reply) {
      const lower = message.toLowerCase();
      if (lower.includes('wrong') || lower.includes('stall') || lower.includes('plateau') || lower.includes('progress')) {
        reply = `🔍 **FitOS Diagnostic Analysis for ${user.name}:**\n\n` +
          `• **Caloric Intake:** Logged **${totalCal} / ${user.calorieGoal} kcal** today.\n` +
          `• **Protein Target:** **${totalProt}g / ${user.proteinGoal}g** (${remProt}g remaining). Ensuring adequate protein protects muscle during fat loss.\n` +
          `• **Activity & Steps:** **${steps.toLocaleString()} steps** logged. Target at least 8,000–10,000 for steady energy expenditure.\n` +
          `• **Recovery:** **${sleep}h sleep**. Insufficient sleep elevates cortisol and causes fluid retention, masking fat loss.\n\n` +
          `💡 **Action Step:** Focus on hitting your ${user.proteinGoal}g protein target and maintaining 7.5+ hours of sleep over the next 5 days.`;
      } else if (lower.includes('eat') || lower.includes('dinner') || lower.includes('food') || lower.includes('meal')) {
        reply = `🥗 **Recommended Meals for Remaining ${remProt}g Protein (${remCal} kcal left):**\n\n` +
          `1. **Grilled Chicken Breast (200g) + Veggies:** ~240 kcal, **46g protein**.\n` +
          `2. **Greek Yogurt (250g) + Scoop of Whey:** ~260 kcal, **40g protein**.\n` +
          `3. **Egg White Omelet (4 whites + 1 whole) & Cottage Cheese:** ~220 kcal, **32g protein**.\n\n` +
          `Which of these ingredients do you have on hand?`;
      } else if (lower.includes('workout') || lower.includes('exercise') || lower.includes('routine') || lower.includes('train')) {
        reply = `🏋️ **Personalized Workout Recommendation for Today:**\n\n` +
          `Based on your recent training volume:\n` +
          `• **Push Focus:** 4x Bench Press (8-10 reps), 3x Incline DB Press (10-12 reps), 3x Lateral Raises (15 reps), 3x Tricep Pushdowns (12-15 reps).\n` +
          `• **Rest Intervals:** 90s between heavy compounds, 60s for accessories.\n\n` +
          `Log this in the **Workout** tab and start the rest timer!`;
      } else {
        reply = `Hey ${user.name}! 👋 You're currently at **${totalCal} / ${user.calorieGoal} kcal** with **${remProt}g protein** left to reach your daily goal. You've logged **${steps.toLocaleString()} steps** and **${water}ml water** today. How can I help you optimize your training, nutrition, or recovery?`;
      }
    }

    res.json({ reply });
  } catch (error) {
    console.error('Coach route error:', error);
    res.status(500).json({ error: 'Failed to process AI coach request.' });
  }
});

export default router;
