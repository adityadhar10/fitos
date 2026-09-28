import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { routineService } from '../services/routineService.js';

export const routineController = {
  getTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = routineService.getTemplates();
      res.json(result);
    } catch (error) {
      console.error('Get templates error:', error);
      next(error);
    }
  },

  async generateRoutine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await routineService.generateRoutine(req.body);
      res.json(result);
    } catch (error) {
      console.error('Generate routine error:', error);
      next(error);
    }
  }
};
