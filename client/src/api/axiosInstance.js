import axios from 'axios';

const GATEWAY_URL =
  import.meta.env.VITE_GATEWAY_URL ||
  import.meta.env.REACT_APP_GATEWAY_URL ||
  (typeof window !== 'undefined' && window.location.port === '3000'
    ? ''
    : 'http://localhost:8088');

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const axiosInstance = axios.create({
  baseURL: GATEWAY_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Only attach Bearer header if authToken is a valid JWT (contains dots)
    if (authToken && typeof authToken === 'string' && authToken.includes('.')) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
