const fs = require('fs');
let workoutCode = fs.readFileSync('frontend/src/pages/Workout.tsx', 'utf8');

// 1. Remove the bad CSS import
workoutCode = workoutCode.replace('import "../pages/Workout.css";', '');
fs.writeFileSync('frontend/src/pages/Workout.tsx', workoutCode);

// 2. Add :root to index.css
let indexCss = fs.readFileSync('frontend/src/index.css', 'utf8');
if (!indexCss.includes(':root {')) {
  const rootVars = `
:root {
  --primary-accent: #4ade80;
  --bg-panel: #111713;
  --bg-elevated: #111713;
  --bg-input: #1a221c;
  --border-color: #1e2620;
  --text-primary: #ffffff;
  --text-secondary: #8a938d;
  --text-muted: #8a938d;
}
`;
  indexCss = rootVars + indexCss;
  fs.writeFileSync('frontend/src/index.css', indexCss);
}
