import { apiClient } from './apiClient.js';

export const getInsight = () => apiClient.get("/insights");
