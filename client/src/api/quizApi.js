import axiosInstance from './axiosInstance';

export const getQuizzes = async () => {
  const response = await axiosInstance.get('/api/quizzes');
  return response.data;
};

export const getQuizById = async (id) => {
  const response = await axiosInstance.get(`/api/quizzes/${id}`);
  return response.data;
};

export const getQuizzesByCourse = async (courseId) => {
  const response = await axiosInstance.get(`/api/quizzes/course/${courseId}`);
  return response.data;
};

export const submitQuiz = async (quizId, selectedOptions, userId) => {
  const response = await axiosInstance.post(`/api/quizzes/${quizId}/submit`, {
    selectedOptions,
    userId,
  });
  return response.data;
};

export const createQuiz = async (quizData) => {
  const response = await axiosInstance.post('/api/quizzes', quizData, {
    headers: {
      'X-User-Role': 'ADMIN',
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const getQuizAttempts = async (quizId, userId) => {
  const response = await axiosInstance.get(`/api/quizzes/${quizId}/attempts/${userId}`);
  return response.data;
};

export const getUserAttempts = async (userId) => {
  const response = await axiosInstance.get(`/api/quizzes/attempts/${userId}`);
  return response.data;
};
