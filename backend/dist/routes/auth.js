import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, passwordHash },
        });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Something went wrong during signup.' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Something went wrong during login.' });
    }
});
// GET /api/auth/me (protected)
router.get('/me', requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, name: true, email: true, calorieGoal: true, proteinGoal: true, carbGoal: true, fatGoal: true },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
});
export default router;
