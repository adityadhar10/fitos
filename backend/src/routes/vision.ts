import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Simple rate limiter to prevent hitting Gemini API quota
const visionRateLimiter = {
  lastCall: 0,
  minInterval: 60000, // 1 minute between API calls
  isRateLimited(): boolean {
    const now = Date.now();
    if (now - this.lastCall < this.minInterval) {
      return true;
    }
    this.lastCall = now;
    return false;
  }
};

// ── Zod schema ───────────────────────────────────────────────────────────────
const analyzeSchema = z.object({
  imageBase64: z.string().min(100, 'Image data is required'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'] as const).default('image/jpeg'),
});

// ── POST /api/vision/analyze ─────────────────────────────────────────────────
router.post('/analyze', requireAuth, validate(analyzeSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'AI service not configured. Please contact support.',
        details: 'API key missing'
      });
    }

    // Check rate limit before attempting API call
    if (visionRateLimiter.isRateLimited()) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please wait 1 minute between AI scans.',
        retryAfter: 60
      });
    }

    const prompt = `You are a precise nutrition analysis AI. Analyze this food photo and respond ONLY with a valid JSON object — no markdown, no explanation, just raw JSON.

The JSON must have exactly these fields:
{
  "description": "Brief food name/description (e.g. 'Grilled chicken with rice and vegetables')",
  "calories": <integer, total estimated calories>,
  "protein": <integer, grams of protein>,
  "carbs": <integer, grams of carbohydrates>,
  "fats": <integer, grams of fat>,
  "mealType": <one of: "breakfast", "lunch", "dinner", "snack">,
  "confidence": <"high" | "medium" | "low">
}

Be as accurate as possible. If you cannot identify the food, use reasonable defaults for an average meal.`;

    let raw = '';
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    };

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent([prompt, imagePart]);
      raw = result.response.text().trim();
    } catch (apiErr: any) {
      console.warn('Gemini 1.5 flash vision error:', apiErr.message, apiErr.status);
      // Check if it's a quota/rate limit error
      if (apiErr.status === 429 || apiErr.message?.includes('quota') || apiErr.message?.includes('rate limit')) {
        return res.status(429).json({ 
          error: 'API quota exceeded. Please wait before trying again.',
          retryAfter: 60
        });
      }
      
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result = await model.generateContent([prompt, imagePart]);
        raw = result.response.text().trim();
      } catch (fallbackErr: any) {
        console.error('Gemini 1.5 pro vision also failed:', fallbackErr.message, fallbackErr.status);
        return res.status(500).json({ 
          error: 'AI service unavailable. Please try again later.',
          details: fallbackErr.message 
        });
      }
    }

    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Gemini returned non-JSON:', raw);
      return res.status(500).json({ error: 'AI could not parse the food image. Please try a clearer photo.' });
    }

    // Validate the parsed response has required fields
    const responseSchema = z.object({
      description: z.string(),
      calories: z.number().int().nonnegative(),
      protein: z.number().int().nonnegative(),
      carbs: z.number().int().nonnegative(),
      fats: z.number().int().nonnegative(),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'] as const),
      confidence: z.enum(['high', 'medium', 'low'] as const),
    });

    const validated = responseSchema.safeParse(parsed);
    if (!validated.success) {
      return res.status(500).json({ error: 'AI returned unexpected data format.' });
    }

    res.json({ analysis: validated.data });
  } catch (error) {
    console.error('Vision analyze error:', error);
    res.status(500).json({ error: 'Failed to analyze food image.' });
  }
});

export default router;
