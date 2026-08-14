import type {
  DashboardData,
  DailySteps,
  NutritionData,
  ActivityData,
  WorkoutEntry,
  ProgressData,
  UserSettings,
  SettingsData,
} from "../types/dashboard";

export const dashboardData: DashboardData = {
  fitnessScore: 87,
  calories: { value: "2,180", target: "/ 2,400 kcal" },
  protein: { value: "142g", target: "/ 160g" },
  steps: { value: "8,420", target: "/ 10,000" },
  sleep: { value: "7.2h", target: "/ 8h" },
  aiInsight:
    "Your activity is slightly below your weekly average. Try completing another 1,500 steps today.",
};

export const weeklySteps: DailySteps[] = [
  { day: "Mon", steps: 6200 },
  { day: "Tue", steps: 7400 },
  { day: "Wed", steps: 5800 },
  { day: "Thu", steps: 8900 },
  { day: "Fri", steps: 7100 },
  { day: "Sat", steps: 9600 },
  { day: "Sun", steps: 8420 },
];

export const nutritionData: NutritionData = {
  dailyCalories: { current: 2180, target: 2400 },
  protein: { value: "142g", target: "/ 160g" },
  carbs: { value: "250g", target: "/ 300g" },
  fats: { value: "70g", target: "/ 82g" },
  meals: [
    {
      id: "m1",
      type: "Breakfast",
      icon: "🍳",
      description: "Eggs, oats & banana",
      calories: 520,
    },
    {
      id: "m2",
      type: "Lunch",
      icon: "🍗",
      description: "Chicken, rice & vegetables",
      calories: 680,
    },
    {
      id: "m3",
      type: "Snack",
      icon: "🥜",
      description: "Peanut butter & whey shake",
      calories: 380,
    },
    {
      id: "m4",
      type: "Dinner",
      icon: "🍽️",
      description: "Paneer, roti & vegetables",
      calories: 600,
    },
  ],
  aiInsight:
    "You're doing well with your nutrition today. You have 220 kcal remaining and only 18g of protein left to reach your daily target.",
};

export const activityData: ActivityData = {
  steps: { value: "8,420", target: "/ 10,000" },
  caloriesBurned: 420,
  activeTime: "1h 25m",
};

export const workoutHistory: WorkoutEntry[] = [
  {
    id: "w1",
    exercise: "Bench Press",
    date: "2026-08-12",
    sets: [
      { reps: 10, weightKg: 40 },
      { reps: 8, weightKg: 45 },
      { reps: 6, weightKg: 50 },
    ],
  },
  {
    id: "w2",
    exercise: "Squat",
    date: "2026-08-12",
    sets: [
      { reps: 10, weightKg: 60 },
      { reps: 8, weightKg: 70 },
    ],
  },
];

export const progressData: ProgressData = {
  currentWeightKg: 74,
  goalWeightKg: 70,
  history: [
    { date: "2026-07-15", weightKg: 76 },
    { date: "2026-07-22", weightKg: 75.4 },
    { date: "2026-07-29", weightKg: 75 },
    { date: "2026-08-05", weightKg: 74.5 },
    { date: "2026-08-12", weightKg: 74 },
  ],
};

export const userSettings: UserSettings = {
  name: "Alex",
  email: "alex@example.com",
  dailyStepGoal: 10000,
  dailyCalorieGoal: 2400,
  sleepGoalHours: 8,
  theme: "dark",
};

export const settingsData: SettingsData = {
  profile: [
    { icon: "👤", label: "Name", value: "Aditya" },
    { icon: "🎯", label: "Fitness Goal", value: "Build Muscle" },
    { icon: "👟", label: "Daily Step Goal", value: "10,000" },
  ],
  preferences: [
    { icon: "🔔", label: "Notifications", value: "Enabled" },
    { icon: "🌙", label: "Dark Mode", value: "Enabled" },
    { icon: "🤖", label: "AI Insights", value: "Enabled" },
  ],
};