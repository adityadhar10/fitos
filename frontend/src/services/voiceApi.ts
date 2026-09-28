import { apiClient } from './apiClient.js';

export const speakText = async (
  text: string,
  onEnd?: () => void,
  onError?: () => void
) => {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (!cleanText) {
    onError?.();
    return;
  }
  try {
    const response = await apiClient.post('/voice/speak', { text: cleanText });
    if (response.data?.success) {
      onEnd?.();
    } else {
      throw new Error('Voice request failed');
    }
  } catch (error) {
    console.error("FitOS voice error:", error);
    onError?.();
  }
};

export const stopSpeech = async () => {
  try {
    await apiClient.post('/voice/stop');
  } catch (error) {
    console.error("FitOS stop voice error:", error);
  }
};
