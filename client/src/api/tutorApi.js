import axiosInstance from './axiosInstance';

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

export const askTutor = async (courseId, question, userId) => {
  const response = await axiosInstance.post('/api/tutor/ask', {
    courseId,
    question,
    userId,
  });
  return response.data;
};

export const summarizeTopic = async (courseId, question, userId) => {
  const response = await axiosInstance.post('/api/tutor/summarize', {
    courseId,
    question,
    userId,
  });
  return response.data;
};

export const getRecommendations = async (courseId, userId) => {
  const response = await axiosInstance.post('/api/tutor/recommend', {
    courseId,
    question: 'recommendations',
    userId,
  });
  return response.data;
};
