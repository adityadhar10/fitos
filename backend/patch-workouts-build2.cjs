const fs = require('fs');
let code = fs.readFileSync('backend/src/routes/workouts.ts', 'utf8');

code = code.replace(/let text = result.text;/g, 'let text = result.text || "";');

fs.writeFileSync('backend/src/routes/workouts.ts', code);
