import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { metricService } from '../services/metricService.js';

export const metricController = {
  async getTodayMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await metricService.getTodayMetrics(req.userId!);
      res.json(result);
    } catch (error) {
      console.error('Get metrics error:', error);
      next(error);
    }
  },

  async updateTodayMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await metricService.updateTodayMetrics(req.userId!, req.body);
      res.json(result);
    } catch (error) {
      console.error('Update metrics error:', error);
      next(error);
    }
  },

  async getWeeklyMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await metricService.getWeeklyMetrics(req.userId!);
      res.json(result);
    } catch (error) {
      console.error('Get weekly metrics error:', error);
      next(error);
    }
  },

  async getStreak(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await metricService.getStreak(req.userId!);
      res.json(result);
    } catch (error) {
      console.error('Get streak error:', error);
      next(error);
    }
  }
};
