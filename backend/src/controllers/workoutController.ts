import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { workoutService } from '../services/workoutService.js';

export const workoutController = {
  async getPRs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await workoutService.getPRs(req.userId!);
      res.json(result);
    } catch (error) {
      console.error('Get PRs error:', error);
      next(error);
    }
  },

  async getSuggestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await workoutService.getSuggestions(req.userId!);
      res.json(result);
    } catch (error) {
      console.error('Get workout suggestions error:', error);
      next(error);
    }
  },

  async getSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await workoutService.getSessions(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getWorkouts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await workoutService.getWorkouts(req.userId!);
      res.json(result);
    } catch (error) {
      console.error('Get workouts error:', error);
      next(error);
    }
  },

  async createSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await workoutService.createSession(req.userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create workout session error:', error);
      next(error);
    }
  },

  async createWorkout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await workoutService.createWorkout(req.userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create workout error:', error);
      next(error);
    }
  },

  async updateSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await workoutService.updateSession(req.userId!, id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Update session error:', error);
      if (error instanceof Error && error.message === 'Session not found.') {
        res.status(404).json({ error: 'Session not found.' });
      } else {
        next(error);
      }
    }
  },

  async deleteSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await workoutService.deleteSession(req.userId!, id);
      res.json(result);
    } catch (error) {
      console.error('Delete session error:', error);
      if (error instanceof Error && error.message === 'Session not found.') {
        res.status(404).json({ error: 'Session not found.' });
      } else {
        next(error);
      }
    }
  },

  async deleteAllSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await workoutService.deleteAllSessions(req.userId!);
      res.json(result);
    } catch (error) {
      console.error('Delete all sessions error:', error);
      next(error);
    }
  },

  async deleteWorkout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await workoutService.deleteWorkout(req.userId!, id);
      res.json(result);
    } catch (error) {
      console.error('Delete workout error:', error);
      if (error instanceof Error && error.message === 'Workout not found.') {
        res.status(404).json({ error: 'Workout not found.' });
      } else {
        next(error);
      }
    }
  },

  async analyzeSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await workoutService.analyzeSession(req.body);
      res.json(result);
    } catch (error) {
      console.error('Analyze error:', error);
      next(error);
    }
  },

  async getAdvice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await workoutService.getAdvice(req.userId!);
      res.json(result);
    } catch (error) {
      console.error('Advice error:', error);
      next(error);
    }
  }
};
