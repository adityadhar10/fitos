import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) { console.log("No user"); return; }
  
  try {
    const session = await prisma.workoutSession.create({
      data: {
        userId: user.id,
        name: 'Test Workout Session',
        date: new Date(),
        workouts: {
          create: [
            {
              userId: user.id,
              name: 'Pushups',
              muscleGroup: 'Chest',
              sets: {
                create: [
                  { reps: 10, weight: 0 }
                ]
              }
            }
          ]
        }
      },
      include: { workouts: { include: { sets: true } } }
    });
    console.log("Success:", session.id);
  } catch (err) {
    console.error("Prisma error:", err);
  }
}
main().then(() => prisma.$disconnect());
