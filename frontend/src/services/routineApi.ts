import { apiClient } from './apiClient.js';

export const getRoutineTemplates = () => apiClient.get('/routines/templates');
export const generateRoutine = (data: {
  goal: string;
  daysPerWeek: number;
  experienceLevel: string;
  equipment: string;
  focusArea?: string;
}) => apiClient.post('/routines/generate', data);
