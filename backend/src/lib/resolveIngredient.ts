import prisma from './prisma.js';
import { lookupIngredient, NutritionPer100g } from '../data/nutritionTable.js';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Resolves an ingredient's per-100g nutrition data using a 3-tier lookup:
 * 1. Database cache (previously resolved ingredients, including AI-added ones)
 * 2. Static hand-curated table (nutritionTable.ts)
 * 3. AI lookup (asks Gemini for just this one ingredient, then saves to DB for next time)
 */
export async function resolveIngredient(name: string): Promise<NutritionPer100g | null> {
  const key = name.trim().toLowerCase();

  // 1. Check database cache first (exact match, then fuzzy substring match)
  try {
    const exact = await prisma.ingredientNutrition.findUnique({ where: { name: key } });
    if (exact) {
      return {
        calories: exact.calories,
        protein: exact.protein,
        carbs: exact.carbs,
        fats: exact.fats,
      };
    }

    // Normalize by stripping parenthetical notes, e.g. "chole (chickpea curry)" -> "chole"
    const normalizedKey = key.replace(/\s*\([^)]*\)\s*/g, '').trim();

    const allCached = await prisma.ingredientNutrition.findMany();
    const fuzzyMatch = allCached.find((row) => {
      const normalizedRow = row.name.replace(/\s*\([^)]*\)\s*/g, '').trim();
      return (
        normalizedRow === normalizedKey ||
        key.includes(row.name) ||
        row.name.includes(key) ||
        normalizedKey.includes(normalizedRow) ||
        normalizedRow.includes(normalizedKey)
      );
    });

    if (fuzzyMatch) {
      return {
        calories: fuzzyMatch.calories,
        protein: fuzzyMatch.protein,
        carbs: fuzzyMatch.carbs,
        fats: fuzzyMatch.fats,
      };
    }
  } catch (err) {
    console.error('DB lookup error for ingredient:', key, err);
  }

  // 2. Check static hand-curated table
  const staticMatch = lookupIngredient(key);
  if (staticMatch) {
    return staticMatch;
  }

  // 3. Not found anywhere — ask AI for this single ingredient
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  try {
    const prompt = `
Provide standard nutrition data per 100 grams for this food ingredient: "${name}"

Return ONLY valid JSON, no markdown, no explanations:

{
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fats": 3.6
}

Use real, standard nutrition data (USDA-style) for a generic/typical version of this ingredient, applicable regardless of country or region. If this is not a real food ingredient, return all zeros.
`;

    const result = await genAI.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const raw = (result.text || '').trim();
    const jsonStr = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(jsonStr);

    if (
      typeof parsed.calories !== 'number' ||
      typeof parsed.protein !== 'number' ||
      typeof parsed.carbs !== 'number' ||
      typeof parsed.fats !== 'number'
    ) {
      return null;
    }

    const nutrition: NutritionPer100g = {
      calories: parsed.calories,
      protein: parsed.protein,
      carbs: parsed.carbs,
      fats: parsed.fats,
    };

    // Save to database so future lookups for this ingredient are instant
    try {
      await prisma.ingredientNutrition.create({
        data: {
          name: key,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fats: nutrition.fats,
          source: 'ai',
        },
      });
    } catch (saveErr) {
      // If another request already saved it concurrently, that's fine — ignore.
      console.error('Failed to cache AI ingredient lookup:', key, saveErr);
    }

    return nutrition;
  } catch (err) {
    console.error('AI ingredient lookup failed for:', key, err);
    return null;
  }
}
