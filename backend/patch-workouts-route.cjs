const fs = require('fs');
let code = fs.readFileSync('backend/src/routes/workouts.ts', 'utf8');

if (!code.includes('addWorkoutSessionSchema')) {
  // Add Zod schema
  const schemaStr = `
export const addWorkoutSessionSchema = z.object({
  name: z.string().max(100),
  date: z.string().optional(),
  exercises: z.array(
    z.object({
      name: z.string().min(1).max(100),
      muscleGroup: z.string().max(50).optional(),
      sets: z.array(
        z.object({
          reps: z.coerce.number().int().positive(),
          weight: z.coerce.number().nonnegative(),
        })
      ).min(1),
    })
  ).min(1),
});
`;
  code = code.replace('export const addWorkoutSchema', schemaStr + '\nexport const addWorkoutSchema');

  // Add Route
  const routeStr = `
router.post('/session', requireAuth, validate(addWorkoutSessionSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { name, date, exercises } = req.body;
    
    // Create Session
    const session = await prisma.workoutSession.create({
      data: {
        userId: req.userId!,
        name: name || 'Workout Session',
        date: date ? new Date(date) : new Date(),
        workouts: {
          create: exercises.map((ex: any) => ({
            userId: req.userId!,
            name: ex.name,
            muscleGroup: ex.muscleGroup || null,
            sets: {
              create: ex.sets.map((s: any) => ({
                reps: s.reps,
                weight: s.weight,
              })),
            },
          })),
        },
      },
      include: {
        workouts: {
          include: { sets: true },
        },
      },
    });

    res.status(201).json({ session });
  } catch (error) {
    console.error('Create workout session error:', error);
    res.status(500).json({ error: 'Failed to create workout session.' });
  }
});

// also fetch sessions in GET /
`;
  code = code.replace("router.post('/', requireAuth", routeStr + "\nrouter.post('/', requireAuth");

  // Include workoutSession when getting workouts
  code = code.replace("include: { sets: true },", "include: { sets: true, workoutSession: true },");
  
  fs.writeFileSync('backend/src/routes/workouts.ts', code);
}
