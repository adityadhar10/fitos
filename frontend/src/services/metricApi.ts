import { apiClient } from './apiClient.js';

export const getTodayMetrics = () => apiClient.get("/metrics/today");
export const updateTodayMetrics = (steps?: number, sleepHours?: number, waterMl?: number) =>
  apiClient.post("/metrics/today", { steps, sleepHours, waterMl });
export const getWeeklyMetrics = () => apiClient.get("/metrics/weekly");
export const getStreak = () => apiClient.get("/metrics/streak");
