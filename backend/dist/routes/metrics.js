import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
// GET /api/metrics/today — get or return default today's steps/sleep
router.get('/today', requireAuth, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const metric = await prisma.dailyMetric.findFirst({
            where: { userId: req.userId, date: { gte: startOfDay } },
        });
        res.json({ metric: metric || { steps: 0, sleepHours: 0 } });
    }
    catch (error) {
        console.error('Get metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch metrics.' });
    }
});
// POST /api/metrics/today — upsert today's steps/sleep
router.post('/today', requireAuth, async (req, res) => {
    try {
        const { steps, sleepHours } = req.body;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const existing = await prisma.dailyMetric.findFirst({
            where: { userId: req.userId, date: { gte: startOfDay } },
        });
        let metric;
        if (existing) {
            metric = await prisma.dailyMetric.update({
                where: { id: existing.id },
                data: {
                    steps: steps !== undefined ? Number(steps) : existing.steps,
                    sleepHours: sleepHours !== undefined ? Number(sleepHours) : existing.sleepHours,
                },
            });
        }
        else {
            metric = await prisma.dailyMetric.create({
                data: {
                    userId: req.userId,
                    steps: steps !== undefined ? Number(steps) : 0,
                    sleepHours: sleepHours !== undefined ? Number(sleepHours) : 0,
                },
            });
        }
        res.json({ metric });
    }
    catch (error) {
        console.error('Update metrics error:', error);
        res.status(500).json({ error: 'Failed to update metrics.' });
    }
});
// GET /api/metrics/weekly — last 7 days of steps
router.get('/weekly', requireAuth, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const metrics = await prisma.dailyMetric.findMany({
            where: { userId: req.userId, date: { gte: sevenDaysAgo } },
            orderBy: { date: 'asc' },
        });
        res.json({ metrics });
    }
    catch (error) {
        console.error('Get weekly metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch weekly metrics.' });
    }
});
export default router;
