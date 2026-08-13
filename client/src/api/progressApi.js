import axios from 'axios';
import { getAuthToken } from './axiosInstance';

// Temporary direct URL until progress-service is routed through API Gateway (http://localhost:8080/api/progress)
// TODO: Switch to API Gateway endpoint (e.g. `${GATEWAY_URL}/api/progress`) once Gateway routing for progress-service is added.
const PROGRESS_SERVICE_URL =
  import.meta.env.VITE_PROGRESS_SERVICE_URL ||
  import.meta.env.REACT_APP_PROGRESS_SERVICE_URL ||
  'http://localhost:8084';

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
  const response = await axios.get(`${PROGRESS_SERVICE_URL}/progress/${userId}`, {
    headers: getHeaders(),
  });
  return response.data;
};

// TODO: Replace ${PROGRESS_SERVICE_URL}/progress with API Gateway route once configured
export const getCourseProgress = async (userId, courseId) => {
  const response = await axios.get(`${PROGRESS_SERVICE_URL}/progress/${userId}/${courseId}`, {
    headers: getHeaders(),
  });
  return response.data;
};

// TODO: Replace ${PROGRESS_SERVICE_URL}/progress with API Gateway route once configured
export const updateProgress = async (userId, courseId, completedPercent) => {
  const response = await axios.put(
    `${PROGRESS_SERVICE_URL}/progress/${userId}/${courseId}`,
    { completedPercent },
    { headers: getHeaders() }
  );
  return response.data;
};

// TODO: Replace ${PROGRESS_SERVICE_URL}/progress with API Gateway route once configured
export const createProgress = async (userId, courseId) => {
  const response = await axios.post(
    `${PROGRESS_SERVICE_URL}/progress`,
    { userId, courseId },
    { headers: getHeaders() }
  );
  return response.data;
};
