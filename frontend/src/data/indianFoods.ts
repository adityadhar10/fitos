// A small starter dataset of common Indian foods with standard serving sizes.
// Values are approximate averages — feel free to adjust based on your own recipes.

export interface IndianFood {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export const indianFoods: IndianFood[] = [
  { name: "Roti / Chapati", serving: "1 medium (30g)", calories: 80, protein: 3, carbs: 15, fats: 0.5 },
  { name: "Naan", serving: "1 piece (90g)", calories: 260, protein: 8, carbs: 45, fats: 5 },
  { name: "Paratha (plain)", serving: "1 piece (60g)", calories: 180, protein: 4, carbs: 25, fats: 7 },
  { name: "Steamed Rice", serving: "1 katori (150g cooked)", calories: 195, protein: 4, carbs: 43, fats: 0.4 },
  { name: "Dal Tadka", serving: "1 katori (150g)", calories: 150, protein: 8, carbs: 20, fats: 4 },
  { name: "Rajma", serving: "1 katori (150g)", calories: 170, protein: 8, carbs: 25, fats: 4 },
  { name: "Chole (Chickpea Curry)", serving: "1 katori (150g)", calories: 210, protein: 9, carbs: 28, fats: 7 },
  { name: "Paneer Butter Masala", serving: "1 katori (150g)", calories: 320, protein: 12, carbs: 10, fats: 25 },
  { name: "Aloo Sabzi", serving: "1 katori (150g)", calories: 160, protein: 3, carbs: 22, fats: 7 },
  { name: "Bhindi Masala", serving: "1 katori (150g)", calories: 120, protein: 3, carbs: 12, fats: 7 },
  { name: "Idli", serving: "1 piece", calories: 40, protein: 1.5, carbs: 8, fats: 0.2 },
  { name: "Dosa (plain)", serving: "1 piece", calories: 130, protein: 3, carbs: 22, fats: 3.5 },
  { name: "Masala Dosa", serving: "1 piece", calories: 220, protein: 5, carbs: 33, fats: 8 },
  { name: "Upma", serving: "1 bowl (150g)", calories: 200, protein: 4, carbs: 30, fats: 7 },
  { name: "Poha", serving: "1 bowl (150g)", calories: 180, protein: 3, carbs: 30, fats: 5 },
  { name: "Biryani (chicken)", serving: "1 plate (250g)", calories: 450, protein: 20, carbs: 55, fats: 15 },
  { name: "Biryani (veg)", serving: "1 plate (250g)", calories: 380, protein: 8, carbs: 60, fats: 12 },
  { name: "Butter Chicken", serving: "1 katori (150g)", calories: 340, protein: 20, carbs: 8, fats: 24 },
  { name: "Tandoori Chicken", serving: "1 leg piece (100g)", calories: 190, protein: 25, carbs: 2, fats: 9 },
  { name: "Egg Curry", serving: "1 katori (150g, 1 egg)", calories: 180, protein: 9, carbs: 6, fats: 13 },
  { name: "Curd / Dahi", serving: "1 katori (150g)", calories: 100, protein: 6, carbs: 8, fats: 5 },
  { name: "Sambar", serving: "1 katori (150g)", calories: 110, protein: 5, carbs: 15, fats: 3 },
  { name: "Rasam", serving: "1 katori (150g)", calories: 60, protein: 2, carbs: 8, fats: 2 },
  { name: "Chapati with Sabzi (typical meal)", serving: "2 roti + 1 katori sabzi", calories: 320, protein: 8, carbs: 45, fats: 10 },
  { name: "Samosa", serving: "1 piece (medium)", calories: 260, protein: 4, carbs: 24, fats: 17 },
  { name: "Pakora (onion)", serving: "4-5 pieces (100g)", calories: 250, protein: 5, carbs: 22, fats: 16 },
  { name: "Vada Pav", serving: "1 piece", calories: 290, protein: 6, carbs: 40, fats: 12 },
  { name: "Chai (with milk & sugar)", serving: "1 cup (150ml)", calories: 60, protein: 1.5, carbs: 9, fats: 2 },
  { name: "Lassi (sweet)", serving: "1 glass (250ml)", calories: 220, protein: 6, carbs: 30, fats: 8 },
  { name: "Khichdi", serving: "1 bowl (200g)", calories: 220, protein: 7, carbs: 38, fats: 4 },
];