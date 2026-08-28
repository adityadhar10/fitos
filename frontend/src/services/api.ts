import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Attach the JWT token to every request automatically, if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fitos_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Auth ----
export const signup = (name: string, email: string, password: string) =>
  api.post("/auth/signup", { name, email, password });

export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

export const getMe = () => api.get("/auth/me");

export const updateGoals = (goals: {
  calorieGoal?: number;
  proteinGoal?: number;
  carbGoal?: number;
  fatGoal?: number;
}) => api.put("/auth/goals", goals);

// ---- Meals ----
export const getMeals = () => api.get("/meals");
export const addMeal = (
  type: string,
  description: string,
  calories: number,
  protein?: number,
  carbs?: number,
  fats?: number
) => api.post("/meals", { type, description, calories, protein, carbs, fats });
export const deleteMeal = (id: string) => api.delete(`/meals/${id}`);

// ---- Workouts ----
export const getWorkouts = () => api.get("/workouts");
export const addWorkout = (
  name: string,
  sets: { reps: number; weight: number }[],
  muscleGroup?: string
) => api.post("/workouts", { name, sets, muscleGroup });
export const deleteWorkout = (id: string) => api.delete(`/workouts/${id}`);
export const getWorkoutPRs = () => api.get("/workouts/prs");

// ---- Weight ----
export const getWeightHistory = () => api.get("/weight");
export const addWeightEntry = (weight: number) => api.post("/weight", { weight });

// ---- Metrics (steps/sleep/water) ----
export const getTodayMetrics = () => api.get("/metrics/today");
export const updateTodayMetrics = (steps?: number, sleepHours?: number, waterMl?: number) =>
  api.post("/metrics/today", { steps, sleepHours, waterMl });
export const getWeeklyMetrics = () => api.get("/metrics/weekly");
export const getStreak = () => api.get("/metrics/streak");

// ---- AI Coach & Insights ----
export const getInsight = () => api.get("/insights");
export const chatWithCoach = (message: string, history?: { role: string; content: string }[]) =>
  api.post("/coach/chat", { message, history });


// ---- AI Vision & Barcode ----
export const analyzeFood = (imageBase64: string, mimeType = 'image/jpeg') =>
  api.post('/vision/analyze', { imageBase64, mimeType });
export const lookupBarcode = (code: string) =>
  api.get(`/vision/barcode/${code}`);

// ---- Workout Routines ----
export const getRoutineTemplates = () =>
  api.get('/routines/templates');
export const generateRoutine = (data: {
  goal: string;
  daysPerWeek: number;
  experienceLevel: string;
  equipment: string;
  focusArea?: string;
}) => api.post('/routines/generate', data);

// ---- Badges ----
export const getBadges = () => api.get('/badges');

// ---- Export (triggers browser download) ----
async function downloadExport(path: string, filename: string) {
  const token = localStorage.getItem('fitos_token');
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const res = await fetch(`${baseURL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const exportWorkoutCSV    = () => downloadExport('/export/csv',           'fitos-workouts.csv');
export const exportNutritionCSV  = () => downloadExport('/export/nutrition-csv', 'fitos-nutrition.csv');
export const exportWeightCSV     = () => downloadExport('/export/weight-csv',    'fitos-weight.csv');
// ---- Text-based nutrition estimation ----
export const estimateNutritionFromText = (description: string) =>
  api.post('/vision/estimate-text', { description });
