import axiosInstance from './axiosInstance';

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
