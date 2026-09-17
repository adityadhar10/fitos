const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Workout.tsx', 'utf8');

const start = code.indexOf('          onStartWorkout={(routine: any)');
if (start !== -1) {
  const analysisStart = code.indexOf('{analysisWorkout && (');
  code = code.substring(0, start) + code.substring(analysisStart);
  fs.writeFileSync('frontend/src/pages/Workout.tsx', code);
}
