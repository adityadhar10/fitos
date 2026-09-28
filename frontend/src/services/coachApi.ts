import { apiClient } from './apiClient.js';

export const chatWithCoach = (message: string, history?: { role: string; content: string }[]) =>
  apiClient.post("/coach/chat", { message, history });
