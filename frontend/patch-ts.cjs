const fs = require('fs');
let code = fs.readFileSync('frontend/src/data/exercises.ts', 'utf8');
code = code.replace(/export const getWorkoutMuscleInfo = \(name: string, category\?: string\) => \{/, 'export const getWorkoutMuscleInfo = (name: string, category?: string) => {\n  if(name){}\n');
fs.writeFileSync('frontend/src/data/exercises.ts', code);
