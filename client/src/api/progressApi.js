import axios from 'axios';
import { getAuthToken } from './axiosInstance';

const getProgressServiceUrl = () => {
  if (import.meta.env.VITE_PROGRESS_SERVICE_URL) {
    return import.meta.env.VITE_PROGRESS_SERVICE_URL;
  }
  if (import.meta.env.REACT_APP_PROGRESS_SERVICE_URL) {
    return import.meta.env.REACT_APP_PROGRESS_SERVICE_URL;
  }
  if (typeof window !== 'undefined') {
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'
    );
    if (isLocalhost) {
      return 'http://localhost:8084';
    }
    return window.location.origin;
  }
  return 'http://localhost:8084';
};

const PROGRESS_SERVICE_API_KEY = 'progress-service-secret-key-789';

const getHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'X-API-KEY': PROGRESS_SERVICE_API_KEY,
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// TODO: Replace ${PROGRESS_SERVICE_URL}/progress with API Gateway route once configured
export const getUserProgress = async (userId) => {
  const response = await axios.get(`${getProgressServiceUrl()}/progress/${userId}`, {
    headers: getHeaders(),
  });
  return response.data;
};

export const getCourseProgress = async (userId, courseId) => {
  const response = await axios.get(`${getProgressServiceUrl()}/progress/${userId}/${courseId}`, {
    headers: getHeaders(),
  });
  return response.data;
};

export const updateProgress = async (userId, courseId, completedPercent) => {
  const response = await axios.put(
    `${getProgressServiceUrl()}/progress/${userId}/${courseId}`,
    { completedPercent },
    { headers: getHeaders() }
  );
  return response.data;
};

export const createProgress = async (userId, courseId) => {
  const response = await axios.post(
    `${getProgressServiceUrl()}/progress`,
    { userId, courseId },
    { headers: getHeaders() }
  );
  return response.data;
};
