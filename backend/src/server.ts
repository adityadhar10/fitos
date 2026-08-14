import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import mealRoutes from './routes/meals.js';
import workoutRoutes from './routes/workouts.js';
import weightRoutes from './routes/weight.js';
import metricsRoutes from './routes/metrics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'FitOS Backend Server running smoothly!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/metrics', metricsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
