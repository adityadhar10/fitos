const fs = require('fs');
let code = fs.readFileSync('backend/src/routes/workouts.ts', 'utf8');

const getSessionsRoute = `
router.get('/sessions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
      include: {
        workouts: {
          include: { sets: true }
        }
      }
    });
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
});
`;

code = code.replace("router.get('/',", getSessionsRoute + "\nrouter.get('/',");
fs.writeFileSync('backend/src/routes/workouts.ts', code);
