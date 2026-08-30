import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Same schema as in meals.ts — kept in sync manually since it's not exported.
// If meals.ts changes its schema, update this test to match.
const addMealSchema = z.object({
  type: z.string().transform((val) => val.toLowerCase()).pipe(
    z.enum(['breakfast', 'lunch', 'dinner', 'snack'] as const)
  ),
  description: z.string().min(1).max(200),
  calories: z.coerce.number().int().nonnegative(),
  protein: z.coerce.number().int().nonnegative().optional().default(0),
  carbs: z.coerce.number().int().nonnegative().optional().default(0),
  fats: z.coerce.number().int().nonnegative().optional().default(0),
});

describe('addMealSchema', () => {
  it('accepts valid whole-number macros', () => {
    const result = addMealSchema.safeParse({
      type: 'Breakfast',
      description: 'Roti',
      calories: 80,
      protein: 3,
      carbs: 15,
      fats: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects decimal fat values (the exact bug fixed today)', () => {
    // This is the regression we hit: a local food entry with fats: 0.5
    // caused a 400 Bad Request because the schema requires whole integers.
    const result = addMealSchema.safeParse({
      type: 'Breakfast',
      description: 'Roti',
      calories: 80,
      protein: 3,
      carbs: 15,
      fats: 0.5,
    });
    expect(result.success).toBe(false);
  });

  it('defaults protein/carbs/fats to 0 when omitted', () => {
    const result = addMealSchema.safeParse({
      type: 'snack',
      description: 'Apple',
      calories: 95,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.protein).toBe(0);
      expect(result.data.carbs).toBe(0);
      expect(result.data.fats).toBe(0);
    }
  });

  it('rejects an invalid meal type', () => {
    const result = addMealSchema.safeParse({
      type: 'brunch',
      description: 'Roti',
      calories: 80,
    });
    expect(result.success).toBe(false);
  });
});
