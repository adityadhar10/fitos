import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── Zod schema ───────────────────────────────────────────────────────────────
const analyzeSchema = z.object({
  imageBase64: z.string().min(100, 'Image data is required'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'] as const).default('image/jpeg'),
});

// ── POST /api/vision/analyze ─────────────────────────────────────────────────
router.post('/analyze', requireAuth, validate(analyzeSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const raw = result.response.text().trim();

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
