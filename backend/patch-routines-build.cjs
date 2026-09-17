const fs = require('fs');
let code = fs.readFileSync('backend/src/routes/routines.ts', 'utf8');

code = code.replace(/result.text\(\)/g, 'result.text');

fs.writeFileSync('backend/src/routes/routines.ts', code);
