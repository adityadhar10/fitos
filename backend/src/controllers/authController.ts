import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { authService, AuthError } from '../services/authService.js';

export const authController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Something went wrong during signup.' });
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Something went wrong during login.' });
    }
  },

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.getMe(req.userId!);
      res.json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('Get me error:', error);
      res.status(500).json({ error: 'Failed to fetch user.' });
    }
  },

  async updateGoals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.updateGoals(req.userId!, req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('Update goals error:', error);
      res.status(500).json({ error: 'Failed to update goals.' });
    }
  }
};
