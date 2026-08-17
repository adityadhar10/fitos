import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import mealRoutes from './routes/meals.js';
import workoutRoutes from './routes/workouts.js';
import weightRoutes from './routes/weight.js';
import metricsRoutes from './routes/metrics.js';
import insightsRoutes from './routes/insights.js';
import visionRoutes from './routes/vision.js';
import badgesRoutes from './routes/badges.js';
import exportRoutes from './routes/export.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' })); // increased for base64 image upload

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'FitOS Backend running smoothly!', version: '2.0.0' });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/export', exportRoutes);

// ── Global error handler (must be LAST) ──────────────────────────────────────
app.use(errorHandler);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 FitOS v2.0 running on port ${PORT}`);
});
