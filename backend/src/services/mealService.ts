import prisma from '../lib/prisma.js';

export const mealService = {
  async getTodayMeals(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const meals = await prisma.meal.findMany({
      where: { userId, createdAt: { gte: startOfDay } },
      orderBy: { createdAt: 'asc' },
    });
    return { meals };
  },

  async createMeal(userId: string, data: any) {
    const { type, description, calories, protein, carbs, fats } = data;
    const meal = await prisma.meal.create({
      data: { userId, type, description, calories, protein, carbs, fats },
    });
    return { meal };
  },

  async deleteMeal(userId: string, mealId: string) {
    const meal = await prisma.meal.findUnique({ where: { id: mealId } });

    if (!meal || meal.userId !== userId) {
      throw new Error('Meal not found.');
    }

    await prisma.meal.delete({ where: { id: mealId } });
    return { success: true };
  }
};
