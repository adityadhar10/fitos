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
  "salmon": { calories: 208, protein: 20, carbs: 0, fats: 13 },
  "quinoa": { calories: 120, protein: 4.4, carbs: 21.3, fats: 1.9 },
  "avocado": { calories: 160, protein: 2, carbs: 8.5, fats: 14.7 },
  "broccoli": { calories: 35, protein: 2.4, carbs: 7, fats: 0.4 },
  "spinach": { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
  "sweet potato": { calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
  "pasta": { calories: 131, protein: 5, carbs: 25, fats: 1.1 },
  "beef": { calories: 250, protein: 26, carbs: 0, fats: 15 },
  "shrimp": { calories: 99, protein: 24, carbs: 0.2, fats: 0.3 },
  "tofu": { calories: 76, protein: 8, carbs: 1.9, fats: 4.8 },
  "cheese": { calories: 402, protein: 25, carbs: 1.3, fats: 33 },
  "almonds": { calories: 579, protein: 21, carbs: 22, fats: 50 },
  "peanut butter": { calories: 588, protein: 25, carbs: 20, fats: 50 },
  "bread": { calories: 265, protein: 9, carbs: 49, fats: 3.2 },
  "banana": { calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
  "apple": { calories: 52, protein: 0.3, carbs: 14, fats: 0.2 },
  "oats": { calories: 389, protein: 17, carbs: 66, fats: 7 },
};

export function lookupIngredient(name: string): NutritionPer100g | null {
  const key = name.trim().toLowerCase();
  if (nutritionTable[key]) return nutritionTable[key];
  // Try partial match (e.g. "grilled chicken breast" matches "chicken breast")
  const match = Object.keys(nutritionTable).find((k) => key.includes(k));
  return match ? nutritionTable[match] : null;
}
