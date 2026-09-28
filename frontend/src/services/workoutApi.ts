import { apiClient } from './apiClient.js';

export const getWorkouts = () => apiClient.get("/workouts");
export const addWorkout = (
  name: string,
  sets: { reps: number; weight: number }[],
  muscleGroup?: string
) => apiClient.post("/workouts", { name, sets, muscleGroup });
export const deleteWorkout = (id: string) => apiClient.delete(`/workouts/${id}`);
export const getWorkoutPRs = () => apiClient.get("/workouts/prs");
export const getWorkoutSuggestions = () => apiClient.get("/workouts/suggestions");
export const analyzeWorkout = (data: any) => apiClient.post('/workouts/analyze', data).then(res => res.data);
export const getTrainingAdvice = () => apiClient.post('/workouts/advice', {}).then(res => res.data);
export const addWorkoutSession = (
  name: string,
  date: string,
  exercises: { name: string; muscleGroup?: string; sets: { reps: number; weight: number }[] }[]
) => apiClient.post("/workouts/session", { name, date, exercises });
export const getWorkoutSessions = () => apiClient.get("/workouts/sessions");
export const updateWorkoutSession = (
  id: string,
  name: string,
  date: string,
  exercises: { name: string; muscleGroup?: string; sets: { reps: number; weight: number }[] }[]
) => apiClient.put(`/workouts/sessions/${id}`, { name, date, exercises });
export const deleteWorkoutSession = (id: string) => apiClient.delete(`/workouts/sessions/${id}`);
export const deleteAllWorkoutSessions = () => apiClient.delete("/workouts/sessions");
