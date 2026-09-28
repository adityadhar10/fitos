import prisma from '../lib/prisma.js';

export const exportService = {
  async getWorkoutCSV(userId: string) {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: { sets: true },
      orderBy: { date: 'desc' },
    });

    const rows: string[] = ['Date,Workout Name,Muscle Group,Sets,Reps,Weight'];

    for (const w of workouts) {
      const date = new Date(w.date).toISOString().split('T')[0];
      const name = w.name.replace(/,/g, '');
      const group = w.muscleGroup || '';

      if (w.sets.length === 0) {
        rows.push(`${date},${name},${group},0,0,0`);
      } else {
        for (let i = 0; i < w.sets.length; i++) {
          const s = w.sets[i];
          rows.push(`${date},${name},${group},${i + 1},${s.reps},${s.weight}`);
        }
      }
    }

    return rows.join('\n');
  },

  async getNutritionCSV(userId: string) {
    const meals = await prisma.meal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const rows: string[] = ['Date,Meal Type,Description,Calories,Protein (g),Carbs (g),Fats (g)'];

    for (const m of meals) {
      const date = new Date(m.createdAt).toISOString().split('T')[0];
      rows.push(
        `${date},"${m.type}","${m.description}",${m.calories},${m.protein},${m.carbs},${m.fats}`
      );
    }

    return rows.join('\n');
  },

  async getWeightCSV(userId: string) {
    const entries = await prisma.weightEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const rows: string[] = ['Date,Weight (kg)'];
    for (const e of entries) {
      const date = new Date(e.date).toISOString().split('T')[0];
      rows.push(`${date},${e.weight}`);
    }

    return rows.join('\n');
  }
};
