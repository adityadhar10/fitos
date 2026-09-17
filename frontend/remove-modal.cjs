const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Workout.tsx', 'utf8');

const start = code.indexOf('{showRoutineModal && (');
if (start !== -1) {
  const end = code.indexOf(')}', start + 30);
  if (end !== -1) {
    code = code.substring(0, start) + code.substring(end + 2);
    fs.writeFileSync('frontend/src/pages/Workout.tsx', code);
  }
}
