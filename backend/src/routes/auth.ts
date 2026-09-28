import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { authController } from '../controllers/authController.js';

const router = Router();

const authLimiter = createRateLimiter(
  5 * 60 * 1000,
  15,
  'Too many attempts. Please try again in 5 minutes.'
);

// ── Zod schemas ──────────────────────────────────────────────────────────────
export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateGoalsSchema = z.object({
  calorieGoal: z.coerce.number().int().positive().optional(),
  proteinGoal: z.coerce.number().int().positive().optional(),
  carbGoal: z.coerce.number().int().positive().optional(),
  fatGoal: z.coerce.number().int().positive().optional(),
});

// ── Routes ───────────────────────────────────────────────────────────────────

router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', requireAuth, authController.getMe);
router.put('/goals', requireAuth, validate(updateGoalsSchema), authController.updateGoals);

export default router;
