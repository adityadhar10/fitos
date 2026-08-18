
import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ''
);

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiter
// 1 AI scan per minute
// ─────────────────────────────────────────────────────────────────────────────

const visionRateLimiter = {
  lastCall: 0,
  minInterval: 60000,

  isRateLimited(): boolean {
    const now = Date.now();

    if (now - this.lastCall < this.minInterval) {
      return true;
    }

    this.lastCall = now;
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Image analysis request schema
// ─────────────────────────────────────────────────────────────────────────────

const analyzeSchema = z.object({
  imageBase64: z.string().min(100, 'Image data is required'),

  mimeType: z
    .enum(['image/jpeg', 'image/png', 'image/webp'] as const)
    .default('image/jpeg'),
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/vision/analyze
// ─────────────────────────────────────────────────────────────────────────────

router.post(
  '/analyze',
  requireAuth,
  validate(analyzeSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { imageBase64, mimeType } = req.body;

      // Check API key
      if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not configured');

        return res.status(500).json({
          error: 'AI service not configured.',
          details: 'GEMINI_API_KEY is missing.',
        });
      }

      // Rate limit
      if (visionRateLimiter.isRateLimited()) {
        return res.status(429).json({
          error:
            'Rate limit exceeded. Please wait 1 minute between AI scans.',
          retryAfter: 60,
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // Prompt
      // ─────────────────────────────────────────────────────────────────────

      const prompt = `
You are a precise nutrition analysis AI.

Analyze the food in this image.

Estimate the food items, portion size, calories and macronutrients.

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use code fences.
Do NOT add explanations.

Return exactly this structure:

{
  "description": "Brief description of the food",
  "calories": 500,
  "protein": 25,
  "carbs": 60,
  "fats": 15,
  "mealType": "lunch",
  "confidence": "medium"
}

Rules:

- calories must be an integer
- protein must be an integer
- carbs must be an integer
- fats must be an integer
- mealType must be one of:
  breakfast, lunch, dinner, snack
- confidence must be one of:
  high, medium, low

Estimate a realistic portion size from the image.

If you cannot identify the food perfectly, make your best reasonable estimate.
`;

      // ─────────────────────────────────────────────────────────────────────
      // Image data
      // ─────────────────────────────────────────────────────────────────────

      const imagePart = {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      };

      let raw = '';

      try {
        // IMPORTANT:
        // Use a current multimodal Gemini model.
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.6-flash',
        });

        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt,
                },
                imagePart,
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        raw = result.response.text().trim();

        console.log('Gemini vision response:', raw);

      } catch (apiErr: any) {
        console.error('Gemini vision error:', apiErr);

        const message =
          apiErr?.message || 'Unknown Gemini API error';

        const status = apiErr?.status;

        // Quota / rate limit
        if (
          status === 429 ||
          message.toLowerCase().includes('quota') ||
          message.toLowerCase().includes('rate limit')
        ) {
          return res.status(429).json({
            error:
              'Gemini API quota exceeded. Please wait and try again.',
            details: message,
            retryAfter: 60,
          });
        }

        return res.status(500).json({
          error: 'AI service unavailable. Please try again later.',
          details: message,
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // Parse Gemini response
      // ─────────────────────────────────────────────────────────────────────

      let parsed: unknown;

      try {
        const jsonStr = raw
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        parsed = JSON.parse(jsonStr);

      } catch {
        console.error(
          'Gemini returned invalid JSON:',
          raw
        );

        return res.status(500).json({
          error:
            'AI could not understand the food image. Please try a clearer photo.',
          details: 'Gemini returned invalid JSON.',
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // Validate Gemini response
      // ─────────────────────────────────────────────────────────────────────

      const responseSchema = z.object({
        description: z.string(),

        calories: z
          .number()
          .int()
          .nonnegative(),

        protein: z
          .number()
          .int()
          .nonnegative(),

        carbs: z
          .number()
          .int()
          .nonnegative(),

        fats: z
          .number()
          .int()
          .nonnegative(),

        mealType: z.enum([
          'breakfast',
          'lunch',
          'dinner',
          'snack',
        ] as const),

        confidence: z.enum([
          'high',
          'medium',
          'low',
        ] as const),
      });

      const validated =
        responseSchema.safeParse(parsed);

      if (!validated.success) {
        console.error(
          'Invalid Gemini vision response:',
          validated.error
        );

        return res.status(500).json({
          error: 'AI returned unexpected nutrition data.',
          details: validated.error.message,
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // Send result
      // ─────────────────────────────────────────────────────────────────────

      return res.json({
        analysis: validated.data,
      });

    } catch (error: any) {
      console.error(
        'Vision analyze error:',
        error
      );

      return res.status(500).json({
        error: 'Failed to analyze food image.',
        details:
          error?.message || 'Unknown server error.',
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/vision/estimate-text
// ─────────────────────────────────────────────────────────────────────────────

const estimateTextSchema = z.object({
  description: z
    .string()
    .min(2, 'Please describe what you ate'),
});

router.post(
  '/estimate-text',
  requireAuth,
  validate(estimateTextSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { description } = req.body;

      // Check API key
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'AI service not configured.',
          details: 'GEMINI_API_KEY is missing.',
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // Gemini model
      // ─────────────────────────────────────────────────────────────────────

      const model = genAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
      });

      const prompt = `
You are a precise nutrition estimation AI.

The user ate:

"${description}"

Estimate the calories and macronutrients for a realistic standard portion.

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use code fences.
Do NOT add explanations.

Return exactly:

{
  "calories": 500,
  "protein": 25,
  "carbs": 60,
  "fats": 15,
  "confidence": "medium"
}

Rules:

- calories must be an integer
- protein must be an integer
- carbs must be an integer
- fats must be an integer
- confidence must be one of:
  high, medium, low

Use standard nutritional knowledge.
Be realistic about portion sizes.
`;

      let raw = '';

      try {
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        raw = result.response.text().trim();

        console.log(
          'Gemini text response:',
          raw
        );

      } catch (apiErr: any) {
        console.error(
          'Gemini text estimation error:',
          apiErr
        );

        const message =
          apiErr?.message ||
          'Unknown Gemini API error';

        const status = apiErr?.status;

        if (
          status === 429 ||
          message.toLowerCase().includes('quota') ||
          message.toLowerCase().includes('rate limit')
        ) {
          return res.status(429).json({
            error:
              'Gemini API quota exceeded. Please wait and try again.',
            details: message,
            retryAfter: 60,
          });
        }

        return res.status(500).json({
          error:
            'AI service unavailable. Please try again later.',
          details: message,
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // Parse response
      // ─────────────────────────────────────────────────────────────────────

      let parsed: unknown;

      try {
        const jsonStr = raw
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        parsed = JSON.parse(jsonStr);

      } catch {
        console.error(
          'Gemini returned invalid JSON:',
          raw
        );

        return res.status(500).json({
          error:
            'Could not estimate nutrition. Please enter values manually.',
          details: 'Gemini returned invalid JSON.',
        });
      }

      // ─────────────────────────────────────────────────────────────────────
      // Validate response
      // ─────────────────────────────────────────────────────────────────────

      const responseSchema = z.object({
        calories: z
          .number()
          .int()
          .nonnegative(),

        protein: z
          .number()
          .int()
          .nonnegative(),

        carbs: z
          .number()
          .int()
          .nonnegative(),

        fats: z
          .number()
          .int()
          .nonnegative(),

        confidence: z.enum([
          'high',
          'medium',
          'low',
        ] as const),
      });

      const validated =
        responseSchema.safeParse(parsed);

      if (!validated.success) {
        console.error(
          'Invalid Gemini text response:',
          validated.error
        );

        return res.status(500).json({
          error: 'AI returned unexpected nutrition data.',
          details: validated.error.message,
        });
      }

      return res.json({
        estimate: validated.data,
      });

    } catch (error: any) {
      console.error(
        'Text estimate error:',
        error
      );

      return res.status(500).json({
        error: 'Failed to estimate nutrition.',
        details:
          error?.message || 'Unknown server error.',
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Export router
// ─────────────────────────────────────────────────────────────────────────────

export default router;

