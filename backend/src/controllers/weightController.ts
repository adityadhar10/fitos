import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { weightService } from '../services/weightService.js';
import { AppError } from '../middleware/errorHandler.js';

export const weightController = {
  async getWeightHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await weightService.getWeightHistory(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async addWeightEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { weight } = req.body;
      const result = await weightService.addWeightEntry(req.userId!, weight);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
};
