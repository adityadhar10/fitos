import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import mealRoutes from './routes/meals.js';
import workoutRoutes from './routes/workouts.js';
import weightRoutes from './routes/weight.js';
import metricsRoutes from './routes/metrics.js';
import insightsRoutes from './routes/insights.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin) return callback(null, true);
    // Allow any localhost port for local development
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    // Allow any Vercel preview/production deployment
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow production frontend URL from environment variable
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'FitOS Backend Server running smoothly!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/insights', insightsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
