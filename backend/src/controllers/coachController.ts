import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { coachService, CoachError } from '../services/coachService.js';
import { AppError } from '../middleware/errorHandler.js';

export const coachController = {
  async getChatReply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message, history } = req.body;
      const result = await coachService.getChatReply(req.userId!, message, history);
      res.json(result);
    } catch (error) {
      if (error instanceof CoachError) {
        return next(new AppError(error.status, error.message));
      }
      next(error);
    }
  }
};
