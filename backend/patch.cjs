const fs = require('fs');
const file = 'backend/src/routes/workouts.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { GoogleGenAI }')) {
  code = code.replace("import { validate } from '../middleware/validate.js';", "import { validate } from '../middleware/validate.js';\nimport { GoogleGenAI } from '@google/genai';");
  code = code.replace("const router = Router();", "const router = Router();\nconst genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });");
}

const analyzeAdviceRoutes = `
// ── POST /api/workouts/analyze ──────────────────────────────────────────────────
router.post('/analyze', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { exercises, sets, reps, weight, volume, duration } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = \`Analyze this recent workout session:
Exercises: \${JSON.stringify(exercises)}
Total Sets/Reps/Weight data available in session.
Duration: \${duration || 'unknown'} mins
Volume: \${volume || 'unknown'} kg

Provide a concise, professional analysis (max 3 short paragraphs). Focus strictly on:
- Volume balance
- Exercise selection
- Progression / strength trends
- Potential improvements
- Practical next-session suggestions

Do not use emojis. Do not invent data.\`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ analysis: text });
  } catch (error) {
    console.error('Analyze workout error:', error);
    res.status(500).json({ error: 'Failed to analyze workout.' });
  }
});

// ── POST /api/workouts/advice ───────────────────────────────────────────────────
router.post('/advice', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: req.userId },
      include: { sets: true },
      orderBy: { date: 'desc' },
      take: 10,
    });
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = \`Based on this recent workout history:
\${JSON.stringify(workouts)}

Provide professional training advice. Return exactly a JSON object (do NOT wrap in markdown or backticks) with two keys:
{
  "whatToDo": "Specific advice on what muscle groups/exercises to focus on next based on training frequency.",
  "whatToAvoid": "Specific advice on what to avoid (e.g. muscles trained in the last 48 hours)."
}
Do not invent history. Keep it concise.\`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    let advice;
    try {
      advice = JSON.parse(text);
    } catch {
      advice = { whatToDo: "Focus on balanced compound movements.", whatToAvoid: "Avoid overtraining fatigued muscles." };
    }
    res.json(advice);
  } catch (error) {
    console.error('Workout advice error:', error);
    res.status(500).json({ error: 'Failed to fetch training advice.' });
  }
});
`;

if (!code.includes('router.post(\'/analyze\'')) {
  code += analyzeAdviceRoutes;
  fs.writeFileSync(file, code);
  console.log("Patched workouts.ts successfully!");
}
