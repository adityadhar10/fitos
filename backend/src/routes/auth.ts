import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';

// ── Zod schemas ──────────────────────────────────────────────────────────────
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateGoalsSchema = z.object({
  calorieGoal: z.coerce.number().int().positive().optional(),
  proteinGoal: z.coerce.number().int().positive().optional(),
  carbGoal: z.coerce.number().int().positive().optional(),
  fatGoal: z.coerce.number().int().positive().optional(),
});

// ── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', validate(signupSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Something went wrong during signup.' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong during login.' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, name: true, email: true,
        calorieGoal: true, proteinGoal: true, carbGoal: true, fatGoal: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// ── PUT /api/auth/goals ──────────────────────────────────────────────────────
router.put('/goals', requireAuth, validate(updateGoalsSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { calorieGoal, proteinGoal, carbGoal, fatGoal } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { calorieGoal, proteinGoal, carbGoal, fatGoal },
      select: {
        id: true, name: true, email: true,
        calorieGoal: true, proteinGoal: true, carbGoal: true, fatGoal: true,
      },
    });
    res.json({ user });
  } catch (error) {
    console.error('Update goals error:', error);
    res.status(500).json({ error: 'Failed to update goals.' });
  }
});

export default router;
