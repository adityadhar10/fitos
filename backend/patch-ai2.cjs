const fs = require('fs');
let code = fs.readFileSync('backend/src/routes/workouts.ts', 'utf8');

const analyzeStart = code.indexOf("router.post('/analyze'");
if (analyzeStart !== -1) {
  // Let's completely replace the end of the file starting from /analyze
  const pre = code.substring(0, analyzeStart);
  
  const aiCode = `
router.post('/analyze', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionName, exercises } = req.body;
    
    // We expect the user to send the current session for analysis
    const prompt = \`
You are a workout programming assistant inside FitOS. Analyze this specific workout session:
Name: \${sessionName}
Exercises: \${JSON.stringify(exercises)}

Return a JSON object with this exact structure:
{
  "summary": "1-2 sentence overview of the workout",
  "priority": [{"order": 1, "focus": "...", "reason": "...", "suggestedApproach": "..."}],
  "whatToDo": ["..."],
  "whatToAvoid": ["..."],
  "why": "..."
}
Respond ONLY with valid JSON.
\`;

    const result = await genAI.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });
    
    let text = result.text();
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const data = JSON.parse(text);
    
    res.json(data);
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Failed to analyze.' });
  }
});

router.post('/advice', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Get user's recent workouts from the database for real context
    const recentSessions = await prisma.workoutSession.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
      take: 10,
      include: { workouts: { include: { sets: true } } }
    });
    
    // If no sessions, fallback or just say insufficient
    if (!recentSessions || recentSessions.length === 0) {
       return res.json({
         summary: "No recent workout history.",
         priority: [],
         whatToDo: ["Log a few workouts to unlock personalized training recommendations."],
         whatToAvoid: [],
         why: "We need data to give advice."
       });
    }

    const context = recentSessions.map(s => ({
      name: s.name,
      date: s.date,
      exercises: s.workouts.map(w => ({
        name: w.name,
        muscleGroup: w.muscleGroup,
        sets: w.sets.length
      }))
    }));

    const prompt = \`
You are a workout programming assistant inside FitOS. 
You must reason ONLY from the workout history supplied.
Do not invent workouts or dates.
Analyze:
- chronology
- muscle-group recency
- weekly frequency

History:
\${JSON.stringify(context)}

Produce an ordered recommendation for the next training session.
Return a JSON object EXACTLY like this:
{
  "summary": "...",
  "priority": [{"order": 1, "focus": "...", "reason": "...", "suggestedApproach": "..."}],
  "whatToDo": ["...", "..."],
  "whatToAvoid": ["...", "..."],
  "why": "..."
}
Respond ONLY with valid JSON. Do not use emojis.
\`;

    const result = await genAI.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });
    
    let text = result.text();
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const data = JSON.parse(text);
    
    res.json(data);
  } catch (error) {
    console.error('Advice error:', error);
    res.status(500).json({ error: 'Failed to get advice.' });
  }
});

export default router;
`;
  
  fs.writeFileSync('backend/src/routes/workouts.ts', pre + aiCode);
}
