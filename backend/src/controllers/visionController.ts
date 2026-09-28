import { AppError } from "../middleware/errorHandler.js";

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { visionService, VisionError } from '../services/visionService.js';

export const visionController = {
  async analyzeImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { imageBase64, mimeType } = req.body;
      const result = await visionService.analyzeImage(imageBase64, mimeType);
      res.json(result);
    } catch (error) {
      if (error instanceof VisionError) {
        return res.status(error.status).json({
          error: error.message,
          details: error.details,
          ...(error.retryAfter ? { retryAfter: error.retryAfter } : {})
        });
      }
      console.error('Vision analyze error:', error);
      res.status(500).json({
        error: 'Failed to analyze food image.',
        details: error instanceof Error ? error.message : 'Unknown server error.',
      });
    }
  },

  async estimateText(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { description } = req.body;
      const result = await visionService.estimateText(description);
      res.json(result);
    } catch (error) {
      if (error instanceof VisionError) {
        return res.status(error.status).json({
          error: error.message,
          details: error.details,
          ...(error.retryAfter ? { retryAfter: error.retryAfter } : {})
        });
      }
      console.error('Text estimate error:', error);
      res.status(500).json({
        error: 'Failed to estimate nutrition.',
        details: error instanceof Error ? error.message : 'Unknown server error.',
      });
    }
  },

  async lookupBarcode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const code = req.params.code as string;
      const result = await visionService.lookupBarcode(code);
      res.json(result);
    } catch (error) {
      if (error instanceof VisionError) {
        return res.status(error.status).json({ error: error.message });
      }
      console.error('Barcode lookup error:', error);
      res.status(500).json({ error: 'Failed to query barcode database' });
    }
  },

  async searchFoodProxy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        throw new VisionError('Query is required', 400);
      }
      const data = await visionService.searchFoodProxy(query);
      res.json(data);
    } catch (error) {
      if (error instanceof VisionError) {
        return next(new AppError(error.status, error.message));
      }
      next(error);
    }
  }
};
