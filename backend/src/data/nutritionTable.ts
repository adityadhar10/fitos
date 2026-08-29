// Per-100g nutrition reference data (grams-based, deterministic lookup)
// Source: standard nutrition databases (USDA / IFCT approximations)

export interface NutritionPer100g {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export const nutritionTable: Record<string, NutritionPer100g> = {
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  "chicken thigh": { calories: 209, protein: 26, carbs: 0, fats: 10.9 },
  "cooking oil": { calories: 884, protein: 0, carbs: 0, fats: 100 },
  "ghee": { calories: 900, protein: 0, carbs: 0, fats: 100 },
  "butter": { calories: 717, protein: 0.9, carbs: 0.1, fats: 81 },
  "cooked rice": { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  "roti": { calories: 297, protein: 11, carbs: 50, fats: 3.7 },
  "naan": { calories: 289, protein: 9, carbs: 50, fats: 5 },
  "paneer": { calories: 265, protein: 18, carbs: 1.2, fats: 20 },
  "dal": { calories: 116, protein: 9, carbs: 20, fats: 0.4 },
  "egg": { calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  "potato": { calories: 87, protein: 1.9, carbs: 20, fats: 0.1 },
  "onion": { calories: 40, protein: 1.1, carbs: 9.3, fats: 0.1 },
  "tomato": { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2 },
  "yogurt": { calories: 61, protein: 3.5, carbs: 4.7, fats: 3.3 },
  "milk": { calories: 42, protein: 3.4, carbs: 5, fats: 1 },
  "fish": { calories: 206, protein: 22, carbs: 0, fats: 12 },
  "mutton": { calories: 294, protein: 25, carbs: 0, fats: 21 },
  "chickpeas": { calories: 164, protein: 8.9, carbs: 27, fats: 2.6 },
  "kidney beans": { calories: 127, protein: 8.7, carbs: 22.8, fats: 0.5 },
};

export function lookupIngredient(name: string): NutritionPer100g | null {
  const key = name.trim().toLowerCase();
  if (nutritionTable[key]) return nutritionTable[key];
  // Try partial match (e.g. "grilled chicken breast" matches "chicken breast")
  const match = Object.keys(nutritionTable).find((k) => key.includes(k));
  return match ? nutritionTable[match] : null;
}
