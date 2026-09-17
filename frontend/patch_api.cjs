const fs = require('fs');
const file = 'frontend/src/services/api.ts';
let code = fs.readFileSync(file, 'utf8');

const additions = `
// ── AI Workout Features ───────────────────────────────────────────────────────
export const analyzeWorkout = (data: any) => {
  return api.post('/workouts/analyze', data).then(res => res.data);
};

export const getTrainingAdvice = () => {
  return api.post('/workouts/advice', {}).then(res => res.data);
};
`;

if (!code.includes('analyzeWorkout')) {
  code += additions;
  fs.writeFileSync(file, code);
  console.log("Patched frontend api.ts successfully");
}
