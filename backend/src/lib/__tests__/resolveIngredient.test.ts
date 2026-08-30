import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma so tests don't hit a real database
vi.mock('../prisma.js', () => ({
  default: {
    ingredientNutrition: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock Gemini so tests don't make real API calls
vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    models = { generateContent: vi.fn() };
  }
  return { GoogleGenAI: MockGoogleGenAI };
});

import prisma from '../prisma.js';
import { resolveIngredient } from '../resolveIngredient.js';

describe('resolveIngredient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns exact match from database cache', async () => {
    (prisma.ingredientNutrition.findUnique as any).mockResolvedValue({
      name: 'chole',
      calories: 164,
      protein: 8.86,
      carbs: 27.42,
      fats: 2.59,
    });

    const result = await resolveIngredient('chole');

    expect(result).toEqual({
      calories: 164,
      protein: 8.86,
      carbs: 27.42,
      fats: 2.59,
    });
  });

  it('fuzzy-matches ingredient names with parenthetical notes to an existing cached entry', async () => {
    // No exact match for "chole (chickpea curry)"
    (prisma.ingredientNutrition.findUnique as any).mockResolvedValue(null);

    // But "chole" exists in the cache
    (prisma.ingredientNutrition.findMany as any).mockResolvedValue([
      { name: 'chole', calories: 164, protein: 8.86, carbs: 27.42, fats: 2.59 },
      { name: 'bhature', calories: 315, protein: 7.5, carbs: 42, fats: 13.5 },
    ]);

    const result = await resolveIngredient('chole (chickpea curry)');

    // This is the exact regression we fixed today: without fuzzy matching,
    // this would fall through to a fresh (inconsistent) AI lookup instead
    // of reusing the existing "chole" entry.
    expect(result).toEqual({
      calories: 164,
      protein: 8.86,
      carbs: 27.42,
      fats: 2.59,
    });
  });

  it('falls back to the static nutrition table when nothing is cached', async () => {
    (prisma.ingredientNutrition.findUnique as any).mockResolvedValue(null);
    (prisma.ingredientNutrition.findMany as any).mockResolvedValue([]);

    const result = await resolveIngredient('chicken breast');

    // From the static nutritionTable.ts
    expect(result).toEqual({ calories: 165, protein: 31, carbs: 0, fats: 3.6 });
  });
});
