import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { insightService, InsightError } from '../services/insightService.js';
import { AppError } from '../middleware/errorHandler.js';

export const insightController = {
  async getInsight(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await insightService.getInsight(req.userId!);
      res.json(result);
    } catch (error) {
      if (error instanceof InsightError) {
        return next(new AppError(error.status, error.message));
      }
      next(error);
    }
  }
};
