import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * Creates an in-memory rate limiter middleware.
 * @param windowMs Duration window in milliseconds
 * @param maxRequests Maximum allowed requests per IP in the window
 * @param message Error message to return upon rate limit
 */
export function createRateLimiter(
  windowMs = 5 * 60 * 1000,
  maxRequests = 15,
  message = 'Too many requests. Please try again in a few minutes.'
) {
  const ipMap = new Map<string, RateLimitRecord>();

  // Periodically clean up expired entries
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipMap.entries()) {
      if (now > record.resetAt) {
        ipMap.delete(ip);
      }
    }
  }, windowMs);
  if (interval.unref) interval.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = ipMap.get(ip);

    if (!record || now > record.resetAt) {
      ipMap.set(ip, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSec,
      });
    }

    record.count++;
    next();
  };
}
