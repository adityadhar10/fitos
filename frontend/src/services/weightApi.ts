import { apiClient } from './apiClient.js';

export const getWeightHistory = () => apiClient.get("/weight");
export const addWeightEntry = (weight: number) => apiClient.post("/weight", { weight });
