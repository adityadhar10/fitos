import prisma from '../lib/prisma.js';

export const metricService = {
  async getTodayMetrics(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const metric = await prisma.dailyMetric.findFirst({
      where: { userId, date: { gte: startOfDay } },
    });

    return { metric: metric || { steps: 0, sleepHours: 0, waterMl: 0 } };
  },

  async updateTodayMetrics(userId: string, data: any) {
    const { steps, sleepHours, waterMl } = data;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await prisma.dailyMetric.findFirst({
      where: { userId, date: { gte: startOfDay } },
    });

    let metric;
    if (existing) {
      metric = await prisma.dailyMetric.update({
        where: { id: existing.id },
        data: {
          steps: steps !== undefined ? steps : existing.steps,
          sleepHours: sleepHours !== undefined ? sleepHours : existing.sleepHours,
          waterMl: waterMl !== undefined ? waterMl : (existing.waterMl ?? 0),
        },
      });
    } else {
      metric = await prisma.dailyMetric.create({
        data: {
          userId,
          steps: steps ?? 0,
          sleepHours: sleepHours ?? 0,
          waterMl: waterMl ?? 0,
        },
      });
    }

    return { metric };
  },

  async getWeeklyMetrics(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const metrics = await prisma.dailyMetric.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' },
    });

    return { metrics };
  },

  async getStreak(userId: string) {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    sixtyDaysAgo.setHours(0, 0, 0, 0);

    const [metrics, meals] = await Promise.all([
      prisma.dailyMetric.findMany({
        where: { userId, date: { gte: sixtyDaysAgo }, steps: { gt: 0 } },
        select: { date: true },
        orderBy: { date: 'desc' },
      }),
      prisma.meal.findMany({
        where: { userId, createdAt: { gte: sixtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
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

    return { streak };
  }
};
