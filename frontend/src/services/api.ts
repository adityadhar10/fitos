import axios from "axios";

const API_URL = "http://localhost:5001/api";

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
// ---- Workouts ----
export const getWorkouts = () => api.get("/workouts");
export const addWorkout = (name: string, sets: { reps: number; weight: number }[]) =>
  api.post("/workouts", { name, sets });

// ---- Weight ----
export const getWeightHistory = () => api.get("/weight");
export const addWeightEntry = (weight: number) => api.post("/weight", { weight });

// ---- Metrics (steps/sleep) ----
export const getTodayMetrics = () => api.get("/metrics/today");
export const updateTodayMetrics = (steps?: number, sleepHours?: number) =>
  api.post("/metrics/today", { steps, sleepHours });
export const getWeeklyMetrics = () => api.get("/metrics/weekly");
// ---- AI Insights ----
export const getInsight = () => api.get("/insights");
