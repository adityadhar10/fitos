import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Zod validation errors — readable field-level messages
  if (err instanceof ZodError) {
    const messages = err.issues.map((e) => `${e.path.map(String).join('.')}: ${e.message}`);
    res.status(400).json({ error: 'Validation failed.', details: messages });
    return;
  }

  // Known operational errors with a status code
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unknown errors — don't leak internals
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
}

/** Throw this anywhere to return a structured HTTP error */
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}
