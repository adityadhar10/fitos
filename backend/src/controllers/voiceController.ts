import { Request, Response, NextFunction } from "express";
import { voiceService, VoiceError } from "../services/voiceService.js";
import { AppError } from "../middleware/errorHandler.js";

export const voiceController = {
  speak(req: Request, res: Response, next: NextFunction) {
    try {
      const result = voiceService.startSpeech(req.body?.text);
      res.json(result);
    } catch (error) {
      if (error instanceof VoiceError) {
        return next(new AppError(error.status, error.message));
      }
      
      console.error("FITOS VOICE ROUTE ERROR:", error);
      next(new AppError(500, "Failed to start speech."));
    }
  },

  stop(req: Request, res: Response, next: NextFunction) {
    try {
      const result = voiceService.stopSpeech();
      res.json(result);
    } catch (error) {
      console.error("FITOS VOICE STOP ERROR:", error);
      next(new AppError(500, "Failed to stop speech."));
    }
  }
};
