import axios from 'axios';
import axiosInstance from './axiosInstance';

// Quiz service uses a different API key and header casing ("X-API-Key")
const QUIZ_SERVICE_API_KEY = 'quiz-service-secret-key-101';

// Direct URL to quiz-service (bypasses API gateway)
const QUIZ_SERVICE_DIRECT_URL =
  import.meta.env.VITE_QUIZ_SERVICE_URL || 'http://localhost:8083';

/**
 * Helper: try the API gateway first, fall back to direct quiz-service if gateway is down.
 * Quiz service expects header "X-API-Key" (not "X-API-KEY").
 */
const quizRequest = async (method, path, data = null, extraHeaders = {}) => {
  const headers = {
    'X-API-Key': QUIZ_SERVICE_API_KEY,
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  // Attempt 1: via API Gateway (/api/quizzes/...)
  try {
    const response = await axiosInstance({ method, url: `/api/quizzes${path}`, data, headers });
    return response.data;
  } catch (gatewayErr) {
    const isNetworkError =
      !gatewayErr.response ||
      gatewayErr.code === 'ERR_NETWORK' ||
      gatewayErr.code === 'ECONNREFUSED' ||
      gatewayErr.message?.includes('Network Error');

    if (!isNetworkError) {
      throw gatewayErr;
    }

    console.warn('[quizApi] Gateway unreachable, falling back to direct quiz-service…');
  }

  // Attempt 2: direct to quiz-service (/quizzes/...)
  const response = await axios({ method, url: `${QUIZ_SERVICE_DIRECT_URL}/quizzes${path}`, data, headers });
  return response.data;
};

export const getQuizzes = async () => {
  return quizRequest('get', '');
};

export const getQuizById = async (id) => {
  return quizRequest('get', `/${id}`);
};

export const getQuizzesByCourse = async (courseId) => {
  return quizRequest('get', `/course/${courseId}`);
};

export const submitQuiz = async (quizId, selectedOptions, userId) => {
  return quizRequest('post', `/${quizId}/submit`, { selectedOptions, userId });
};

export const createQuiz = async (quizData) => {
  return quizRequest('post', '', quizData, { 'X-User-Role': 'ADMIN' });
};

export const getQuizAttempts = async (quizId, userId) => {
  return quizRequest('get', `/${quizId}/attempts/${userId}`);
};

export const getUserAttempts = async (userId) => {
  return quizRequest('get', `/attempts/${userId}`);
};
