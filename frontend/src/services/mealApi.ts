import { apiClient } from './apiClient.js';

export const getMeals = () => apiClient.get("/meals");
export const addMeal = (
  type: string,
  description: string,
  calories: number,
  protein?: number,
  carbs?: number,
  fats?: number
) => apiClient.post("/meals", { type, description, calories, protein, carbs, fats });
export const deleteMeal = (id: string) => apiClient.delete(`/meals/${id}`);
