import { apiClient } from './apiClient.js';

export const signup = (name: string, email: string, password: string) =>
  apiClient.post("/auth/signup", { name, email, password });

export const login = (email: string, password: string) =>
  apiClient.post("/auth/login", { email, password });

export const getMe = () => apiClient.get("/auth/me");

export const updateGoals = (goals: {
  calorieGoal?: number;
  proteinGoal?: number;
  carbGoal?: number;
  fatGoal?: number;
}) => apiClient.put("/auth/goals", goals);
