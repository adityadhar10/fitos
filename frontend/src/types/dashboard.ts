export interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  target: string;
}

export interface DashboardData {
  fitnessScore: number;
  calories: { value: string; target: string };
  protein: { value: string; target: string };
  steps: { value: string; target: string };
  sleep: { value: string; target: string };
  aiInsight: string;
}

export interface DailySteps {
  day: string;
  steps: number;
}

// ---- Nutrition ----
export interface MacroStat {
  value: string;
  target: string;
}

export interface Meal {
  id: string;
  type: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  icon: string;
  description: string;
  calories: number;
}

export interface NutritionData {
  dailyCalories: { current: number; target: number };
  protein: MacroStat;
  carbs: MacroStat;
  fats: MacroStat;
  meals: Meal[];
  aiInsight: string;
}

// ---- Activity ----
export interface ActivityData {
  steps: { value: string; target: string };
  caloriesBurned: number;
  activeTime: string;
}

// ---- Workout ----
export interface WorkoutSet {
  reps: number;
  weightKg: number;
}

export interface WorkoutEntry {
  id: string;
  exercise: string;
  date: string;
  sets: WorkoutSet[];
}

// ---- Progress ----
export interface WeightEntry {
  date: string;
  weightKg: number;
}

export interface ProgressData {
  currentWeightKg: number;
  goalWeightKg: number;
  history: WeightEntry[];
}

// ---- Settings ----
export interface UserSettings {
  name: string;
  email: string;
  dailyStepGoal: number;
  dailyCalorieGoal: number;
  sleepGoalHours: number;
  theme: "dark" | "light";
}

export interface SettingItem {
  icon: string;
  label: string;
  value: string;
}

export interface SettingsData {
  profile: SettingItem[];
  preferences: SettingItem[];
}