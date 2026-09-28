import { GoogleGenAI } from '@google/genai';

import { z } from 'zod';
import { resolveIngredient } from '../lib/resolveIngredient.js';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export class VisionError extends Error {
  status: number;
  details?: string;
  retryAfter?: number;

  constructor(message: string, status: number, details?: string, retryAfter?: number) {
    super(message);
    this.status = status;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

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

export const visionService = {
  async analyzeImage(imageBase64Raw: string, mimeType: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw new VisionError('AI service not configured.', 500, 'GEMINI_API_KEY is missing.');
    }

    if (visionRateLimiter.isRateLimited()) {
      throw new VisionError('Rate limit exceeded. Please wait 1 minute between AI scans.', 429, undefined, 60);
    }

    const imageBase64 = imageBase64Raw.includes(',')
      ? imageBase64Raw.split(',')[1]
      : imageBase64Raw;

    const prompt = `
You are a food-parsing AI specializing in identifying meals from photos, including Indian home cooking.

Look at this food image and break it down into a list of individual ingredients with their estimated weight in grams, plus a brief description and likely meal type.

Important assumptions for Indian cooking, unless clearly visible otherwise:
- If the dish appears to be a curry, sabzi, gravy, or stir-fry, assume it includes approximately 21 grams of cooking oil or ghee unless it clearly looks dry-roasted, boiled, or oil-free.
- Do NOT add cooking oil separately for dishes that appear grilled, baked, steamed, boiled, raw, or roasted without visible oil.
- Fried breads (poori, bhature, etc.) should account for the oil absorbed during frying as part of their own weight/calorie density, not as a separate oil ingredient.
- Use realistic Indian household portion sizes for rice, roti, curries, and sides.

Return ONLY valid JSON. Do NOT use markdown or code fences. Do NOT add explanations.

Return exactly this structure:

{
  "description": "Brief description of the food",
  "mealType": "lunch",
  "ingredients": [
    { "name": "chole (chickpea curry)", "grams": 200 },
    { "name": "bhature", "grams": 150 }
  ]
}

Rules:
- mealType must be one of: breakfast, lunch, dinner, snack
- Use simple, generic ingredient names so they can be matched against a standard nutrition database (e.g. "chole", "bhature", "roti", "paneer", "rice", "dal", "chicken curry").
- If you cannot identify the food perfectly, make your best reasonable estimate.
`;

    const imagePart = {
      inlineData: { mimeType, data: imageBase64 },
    };

    let raw = '';
    try {
      const result = await genAI.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
        config: { responseMimeType: 'application/json' },
      });

      raw = (result.text || '').trim();
      if (process.env.NODE_ENV !== 'production') console.log('Gemini vision ingredient response:', raw);
    } catch (apiErr: any) {
      console.error('Gemini vision error:', apiErr);
      const message = apiErr?.message || 'Unknown Gemini API error';
      const status = apiErr?.status;

      if (
        status === 429 ||
        message.toLowerCase().includes('quota') ||
        message.toLowerCase().includes('rate limit')
      ) {
        throw new VisionError('Gemini API quota exceeded. Please wait and try again.', 429, message, 60);
      }
      throw new VisionError('AI service unavailable. Please try again later.', 500, message);
    }

    let parsed: unknown;
    try {
      const jsonStr = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Gemini returned invalid JSON:', raw);
      throw new VisionError('AI could not understand the food image. Please try a clearer photo.', 500, 'Gemini returned invalid JSON.');
    }

    const imageIngredientSchema = z.object({
      description: z.string(),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'] as const),
      ingredients: z.array(
        z.object({
          name: z.string(),
          grams: z.number().nonnegative(),
        })
      ),
    });

    const validated = imageIngredientSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('Invalid Gemini vision response:', validated.error);
      throw new VisionError('AI returned unexpected food data.', 500, validated.error.message);
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let matchedCount = 0;

    for (const ing of validated.data.ingredients) {
      const ref = await resolveIngredient(ing.name);
      if (ref) {
        const factor = ing.grams / 100;
        totalCalories += ref.calories * factor;
        totalProtein += ref.protein * factor;
        totalCarbs += ref.carbs * factor;
        totalFats += ref.fats * factor;
        matchedCount++;
      }
    }

    const confidence: 'high' | 'medium' | 'low' =
      matchedCount === validated.data.ingredients.length && matchedCount > 0
        ? 'high'
        : matchedCount > 0
        ? 'medium'
        : 'low';

    const analysis = {
      description: validated.data.description,
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fats: Math.round(totalFats),
      mealType: validated.data.mealType,
      confidence,
    };

    return { analysis, ingredients: validated.data.ingredients };
  },

  async estimateText(description: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw new VisionError('AI service not configured.', 500, 'GEMINI_API_KEY is missing.');
    }

    const prompt = `
You are a food-parsing AI specializing in Indian home cooking.

The user ate:

"${description}"

Break this meal down into a list of individual ingredients with their estimated weight in grams.

Important assumptions for Indian cooking, unless the user specifies otherwise:
- If oil, ghee, or butter is mentioned without a quantity, assume exactly 21 grams (about 1.5 tablespoons) for a normal single-dish serving.
- Curries, sabzis, gravies, and stir-fries almost always include cooking oil or ghee even if not explicitly stated — include it as an ingredient with 21 grams unless the user says "no oil", "dry roasted", "boiled", or similar.
- Do NOT add cooking oil as a separate ingredient for dishes described as "grilled", "baked", "steamed", "boiled", "raw", "roasted" (without oil mentioned), or salads — these cooking methods typically use little to no added oil unless the user explicitly mentions oil, butter, or ghee.
- Only add oil/ghee as an assumed ingredient when the dish is clearly a wet-cooked Indian-style preparation (curry, sabzi, dal, stir-fry) or the user explicitly mentions oil/ghee/butter themselves.
- "1 small bowl rice" should be treated as approximately 120 grams cooked rice.
- "1 roti" or "1 chapati" should be treated as approximately 30 grams.
- Cooked quinoa, rice, pasta, or other grains: if no quantity is given, assume a standard single serving of 180-200 grams cooked.
- A whole avocado: if no quantity is given, assume 1 medium avocado = 150 grams.
- Grilled/cooked fish or meat: if a weight is given (e.g. "200g salmon"), use that exact weight. If no weight is given, assume a standard single serving of 150-180 grams.
- Spices/masalas contribute negligible weight and can be omitted from the list.
- If the user gives an exact weight (e.g. "250 gm chicken breast"), use that exact number.

Return ONLY valid JSON. Do NOT use markdown or code fences. Do NOT add explanations.

Return exactly this structure (array of ingredients):

{
  "ingredients": [
    { "name": "chicken breast", "grams": 250 },
    { "name": "cooking oil", "grams": 21 },
    { "name": "cooked rice", "grams": 120 }
  ]
}

Use simple, generic ingredient names (e.g. "chicken breast", "cooking oil", "cooked rice", "roti", "paneer", "dal") so they can be matched against a standard nutrition database.
`;

    let raw = '';
    try {
      const result = await genAI.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' },
      });

      raw = (result.text || '').trim();
      if (process.env.NODE_ENV !== 'production') console.log('Gemini ingredient response:', raw);
    } catch (apiErr: any) {
      console.error('Gemini text estimation error:', apiErr);
      const message = apiErr?.message || 'Unknown Gemini API error';
      const status = apiErr?.status;

      if (
        status === 429 ||
        message.toLowerCase().includes('quota') ||
        message.toLowerCase().includes('rate limit')
      ) {
        throw new VisionError('Gemini API quota exceeded. Please wait and try again.', 429, message, 60);
      }
      throw new VisionError('AI service unavailable. Please try again later.', 500, message);
    }

    let parsed: unknown;
    try {
      const jsonStr = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Gemini returned invalid JSON:', raw);
      throw new VisionError('Could not estimate nutrition. Please enter values manually.', 500, 'Gemini returned invalid JSON.');
    }

    const ingredientSchema = z.object({
      ingredients: z.array(
        z.object({
          name: z.string(),
          grams: z.number().nonnegative(),
        })
      ),
    });

    const validated = ingredientSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('Invalid Gemini ingredient response:', validated.error);
      throw new VisionError('AI returned unexpected ingredient data.', 500, validated.error.message);
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let matchedCount = 0;

    for (const ing of validated.data.ingredients) {
      const ref = await resolveIngredient(ing.name);
      if (ref) {
        const factor = ing.grams / 100;
        totalCalories += ref.calories * factor;
        totalProtein += ref.protein * factor;
        totalCarbs += ref.carbs * factor;
        totalFats += ref.fats * factor;
        matchedCount++;
      }
    }

    const confidence: 'high' | 'medium' | 'low' =
      matchedCount === validated.data.ingredients.length && matchedCount > 0
        ? 'high'
        : matchedCount > 0
        ? 'medium'
        : 'low';

    const estimate = {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fats: Math.round(totalFats),
      confidence,
    };

    return { estimate, ingredients: validated.data.ingredients };
  },

  async lookupBarcode(code: string) {
    if (!/^\d+$/.test(code)) {
      throw new VisionError('Invalid barcode format', 400);
    }

    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
    if (!response.ok) {
      throw new VisionError('Product not found for this barcode', 404);
    }

    const data = (await response.json()) as any;
    if (data.status !== 1 || !data.product) {
      throw new VisionError('Product not found in OpenFoodFacts database', 404);
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    const name = p.product_name || p.generic_name || 'Scanned Food Product';
    const brand = p.brands ? ` (${p.brands})` : '';
    const calories = Math.round(nutriments['energy-kcal_serving'] ?? nutriments['energy-kcal_100g'] ?? 0);
    const protein = Math.round(nutriments['proteins_serving'] ?? nutriments['proteins_100g'] ?? 0);
    const carbs = Math.round(nutriments['carbohydrates_serving'] ?? nutriments['carbohydrates_100g'] ?? 0);
    const fats = Math.round(nutriments['fat_serving'] ?? nutriments['fat_100g'] ?? 0);

    return {
      product: {
        name: `${name}${brand}`,
        calories: calories || 150,
        protein: protein || 0,
        carbs: carbs || 0,
        fats: fats || 0,
        servingSize: p.serving_size || '100g',
      },
    };
  },

  async searchFoodProxy(query: string) {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new VisionError("Failed to search food", res.status);
    }
    const data = await res.json();
    return data;
  }
};
