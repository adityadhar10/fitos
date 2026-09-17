const fs = require('fs');
let code = fs.readFileSync('frontend/src/services/api.ts', 'utf8');

if (!code.includes('getWorkoutSessions')) {
  code += `\nexport const getWorkoutSessions = () => api.get("/workouts/sessions");\n`;
  fs.writeFileSync('frontend/src/services/api.ts', code);
}
