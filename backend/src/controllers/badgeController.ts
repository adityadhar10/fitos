import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { badgeService } from '../services/badgeService.js';

export const badgeController = {
  async getBadges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await badgeService.getBadges(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
