import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── Badge definitions ─────────────────────────────────────────────────────────
export interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'first_workout',   emoji: '🔥', name: 'First Workout',   description: 'Logged your very first workout' },
  { id: 'first_meal',      emoji: '🍽️', name: 'First Meal',       description: 'Logged your very first meal' },
  { id: 'first_weight',    emoji: '⚖️', name: 'First Weigh-In',   description: 'Logged your first body weight' },
  { id: '7_day_streak',    emoji: '🏅', name: '7-Day Streak',     description: '7 consecutive days with any activity' },
  { id: '5_workouts',      emoji: '💪', name: 'Dedicated',        description: 'Completed 5 total workouts' },
  { id: '10_workouts',     emoji: '🏆', name: 'Consistent',       description: 'Completed 10 total workouts' },
  { id: 'protein_king',    emoji: '🥩', name: 'Protein King',     description: 'Logged 5 meals with ≥ 30g protein each' },
  { id: 'step_master',     emoji: '🚶', name: 'Step Master',      description: 'Logged 10,000+ steps in a single day' },
  { id: 'weight_tracker',  emoji: '📉', name: 'Weight Tracker',   description: 'Logged weight 5+ times' },
];

// ── Helper: compute which badges the user has earned ─────────────────────────
async function computeEarnedBadges(userId: string): Promise<string[]> {
  const earned: string[] = [];

  const [workouts, meals, weightEntries, metrics, streak] = await Promise.all([
    prisma.workout.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
    prisma.meal.findMany({ where: { userId } }),
    prisma.weightEntry.findMany({ where: { userId } }),
    prisma.dailyMetric.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    computeStreak(userId),
  ]);

  // first_workout
  if (workouts.length >= 1) earned.push('first_workout');

  // first_meal
  if (meals.length >= 1) earned.push('first_meal');

  // first_weight
  if (weightEntries.length >= 1) earned.push('first_weight');

  // 5_workouts
  if (workouts.length >= 5) earned.push('5_workouts');

  // 10_workouts
  if (workouts.length >= 10) earned.push('10_workouts');

  // 7_day_streak
  if (streak >= 7) earned.push('7_day_streak');

  // protein_king — 5 meals with >= 30g protein
  const highProteinMeals = meals.filter((m) => m.protein >= 30);
  if (highProteinMeals.length >= 5) earned.push('protein_king');

  // step_master — any single day with >= 10000 steps
  const hasStepDay = metrics.some((m) => m.steps >= 10000);
  if (hasStepDay) earned.push('step_master');

  // weight_tracker — 5+ weigh-ins
  if (weightEntries.length >= 5) earned.push('weight_tracker');

  return earned;
}

async function computeStreak(userId: string): Promise<number> {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  sixtyDaysAgo.setHours(0, 0, 0, 0);

  const [metrics, meals] = await Promise.all([
    prisma.dailyMetric.findMany({
      where: { userId, date: { gte: sixtyDaysAgo }, steps: { gt: 0 } },
      select: { date: true },
    }),
    prisma.meal.findMany({
      where: { userId, createdAt: { gte: sixtyDaysAgo } },
      select: { createdAt: true },
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
  return streak;
}

// ── GET /api/badges ───────────────────────────────────────────────────────────
// Returns all badge definitions + which ones the user has earned (with earnedAt date)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Compute which badges should be earned now
    const shouldBeEarned = await computeEarnedBadges(userId);

    // Upsert any newly earned badges into the DB
    await Promise.all(
      shouldBeEarned.map((badgeId) =>
        prisma.userBadge.upsert({
          where: { userId_badgeId: { userId, badgeId } },
          update: {},
          create: { userId, badgeId },
        })
      )
    );

    // Fetch all earned badges from DB (includes earnedAt timestamp)
    const earnedRows = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'asc' },
    });

    const earnedMap = new Map(earnedRows.map((r) => [r.badgeId, r.earnedAt]));

    const badges = BADGE_DEFS.map((def) => ({
      ...def,
      earned: earnedMap.has(def.id),
      earnedAt: earnedMap.get(def.id) ?? null,
    }));

    const totalEarned = badges.filter((b) => b.earned).length;

    res.json({ badges, totalEarned, totalAvailable: BADGE_DEFS.length });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to fetch badges.' });
  }
});

export default router;
