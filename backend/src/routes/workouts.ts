import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { workoutController } from '../controllers/workoutController.js';

const router = Router();

// ── Zod schemas ──────────────────────────────────────────────────────────────

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

export const addWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100),
  muscleGroup: z.string().max(50).optional(),
  sets: z
    .array(
      z.object({
        reps: z.coerce.number().int().positive('Reps must be positive'),
        weight: z.coerce.number().nonnegative('Weight must be 0 or more'),
      })
    )
    .min(1, 'At least one set is required'),
});

// ── Routes ───────────────────────────────────────────────────────────────────

router.get('/prs', requireAuth, workoutController.getPRs);
router.get('/suggestions', requireAuth, workoutController.getSuggestions);
router.get('/sessions', requireAuth, workoutController.getSessions);
router.get('/', requireAuth, workoutController.getWorkouts);

router.post('/session', requireAuth, validate(addWorkoutSessionSchema), workoutController.createSession);
router.post('/', requireAuth, validate(addWorkoutSchema), workoutController.createWorkout);

router.put('/sessions/:id', requireAuth, workoutController.updateSession);

router.delete('/sessions/:id', requireAuth, workoutController.deleteSession);
router.delete('/sessions', requireAuth, workoutController.deleteAllSessions);
router.delete('/:id', requireAuth, workoutController.deleteWorkout);

router.post('/analyze', requireAuth, workoutController.analyzeSession);
router.post('/advice', requireAuth, workoutController.getAdvice);

export default router;
