import prisma from '../lib/prisma.js';

export const weightService = {
  async getWeightHistory(userId: string) {
    const entries = await prisma.weightEntry.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
    return { entries };
  },

  async addWeightEntry(userId: string, weight: number) {
    const entry = await prisma.weightEntry.create({
      data: { userId, weight },
    });
    return { entry };
  }
};
