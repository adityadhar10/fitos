import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { exportService } from '../services/exportService.js';

export const exportController = {
  async exportWorkoutCSV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const csv = await exportService.getWorkoutCSV(req.userId!);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fitos-workouts.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  async exportNutritionCSV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const csv = await exportService.getNutritionCSV(req.userId!);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fitos-nutrition.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  async exportWeightCSV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const csv = await exportService.getWeightCSV(req.userId!);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fitos-weight.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
};
