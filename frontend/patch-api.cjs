const fs = require('fs');
let code = fs.readFileSync('frontend/src/services/api.ts', 'utf8');

if (!code.includes('addWorkoutSession')) {
  const newMethod = `
export const addWorkoutSession = (
  name: string,
  date: string,
  exercises: { name: string; muscleGroup?: string; sets: { reps: number; weight: number }[] }[]
) => api.post("/workouts/session", { name, date, exercises });
`;
  code = code + newMethod;
  fs.writeFileSync('frontend/src/services/api.ts', code);
}
