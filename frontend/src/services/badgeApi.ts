import { apiClient } from './apiClient.js';

export const getBadges = () => apiClient.get('/badges');
