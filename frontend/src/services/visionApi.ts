import { apiClient } from './apiClient.js';

export const analyzeFood = (imageBase64: string, mimeType = 'image/jpeg') =>
  apiClient.post('/vision/analyze', { imageBase64, mimeType });

export const estimateNutritionFromText = (description: string) =>
  apiClient.post('/vision/estimate-text', { description });

export const lookupBarcode = (code: string) => apiClient.get(`/vision/barcode/${code}`);
export const searchFoodFromProxy = (query: string) => apiClient.get(`/vision/search-food?query=${encodeURIComponent(query)}`);
