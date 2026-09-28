import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { mealService } from '../services/mealService.js';

export const mealController = {
  async getTodayMeals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await mealService.getTodayMeals(req.userId!);
      res.json(result);
    } catch (error) {
      console.error('Get meals error:', error);
      next(error);
    }
  },

  async createMeal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await mealService.createMeal(req.userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create meal error:', error);
      next(error);
    }
  },

  async deleteMeal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const mealId = req.params.id as string;
      const result = await mealService.deleteMeal(req.userId!, mealId);
      res.json(result);
    } catch (error) {
      console.error('Delete meal error:', error);
      if (error instanceof Error && error.message === 'Meal not found.') {
        res.status(404).json({ error: 'Meal not found.' });
      } else {
        next(error);
      }
    }
  }
};
