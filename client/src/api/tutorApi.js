import axiosInstance from './axiosInstance';

const AI_CONFIG_KEY = 'intellitutor_ai_config';

export const getAiConfig = () => {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return { apiKey: '', provider: 'openai', model: 'gpt-4o-mini' };
    return JSON.parse(raw);
  } catch (e) {
    return { apiKey: '', provider: 'openai', model: 'gpt-4o-mini' };
  }
};

export const saveAiConfig = (config) => {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save AI config to localStorage:', e);
  }
};

export const sendChatMessage = async (message, sessionId, courseId, userId, courseTitle, courseCategory) => {
  const response = await axiosInstance.post('/api/tutor/chat', {
    message,
    sessionId,
    courseId,
    courseTitle,
    courseCategory,
    userId,
  });
  return response.data;
};

export const getSessionHistory = async (sessionId) => {
  const response = await axiosInstance.get(`/api/tutor/chat/session/${sessionId}`);
  return response.data;
};

export const clearChatSession = async (sessionId) => {
  const response = await axiosInstance.delete(`/api/tutor/chat/session/${sessionId}`);
  return response.data;
};

export const askTutor = async (courseId, question, userId, customApiKey, customProvider, customModel) => {
  const currentConfig = getAiConfig();
  const apiKey = customApiKey !== undefined ? customApiKey : currentConfig.apiKey;
  const provider = customProvider !== undefined ? customProvider : currentConfig.provider;
  const model = customModel !== undefined ? customModel : currentConfig.model;

  const response = await axiosInstance.post('/api/tutor/ask', {
    courseId,
    question,
    userId,
    apiKey,
    provider,
    model,
  });
  return response.data;
};

export const summarizeTopic = async (courseId, question, userId) => {
  const currentConfig = getAiConfig();
  const response = await axiosInstance.post('/api/tutor/summarize', {
    courseId,
    question,
    userId,
    apiKey: currentConfig.apiKey,
    provider: currentConfig.provider,
    model: currentConfig.model,
  });
  return response.data;
};

export const getRecommendations = async (courseId, userId) => {
  const currentConfig = getAiConfig();
  const response = await axiosInstance.post('/api/tutor/recommend', {
    courseId,
    question: 'recommendations',
    userId,
    apiKey: currentConfig.apiKey,
    provider: currentConfig.provider,
    model: currentConfig.model,
  });
  return response.data;
};
