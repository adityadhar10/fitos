const fs = require('fs');
let schema = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

if (!schema.includes('WorkoutSession')) {
  schema = schema.replace('workouts     Workout[]', 'workouts     Workout[]\n  workoutSessions WorkoutSession[]');

  const sessionModel = `
model WorkoutSession {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  date      DateTime  @default(now())
  workouts  Workout[]
}
`;

  schema = schema.replace('model Workout {', sessionModel + '\nmodel Workout {\n  workoutSessionId String?\n  workoutSession   WorkoutSession? @relation(fields: [workoutSessionId], references: [id], onDelete: Cascade)');

  fs.writeFileSync('backend/prisma/schema.prisma', schema);
}
