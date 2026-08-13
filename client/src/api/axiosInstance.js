import axios from 'axios';

/**
 * Dynamically resolves the API Gateway URL.
 * Order of precedence:
 * 1. Build-time Vite Env Var (import.meta.env.VITE_GATEWAY_URL)
 * 2. Build-time CRA Env Var (import.meta.env.REACT_APP_GATEWAY_URL)
 * 3. Runtime window override (window.env.VITE_GATEWAY_URL)
 * 4. LocalStorage custom gateway setting (VITE_GATEWAY_URL)
 * 5. Localhost fallback (only when running on local machine)
 * 6. Relative origin fallback (when deployed without VITE_GATEWAY_URL configured)
 */
export const getGatewayUrl = () => {
  if (import.meta.env.VITE_GATEWAY_URL) {
    return import.meta.env.VITE_GATEWAY_URL;
  }
  if (import.meta.env.REACT_APP_GATEWAY_URL) {
    return import.meta.env.REACT_APP_GATEWAY_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.env?.VITE_GATEWAY_URL) {
      return window.env.VITE_GATEWAY_URL;
    }
    const customGateway = localStorage.getItem('VITE_GATEWAY_URL');
    if (customGateway) {
      return customGateway;
    }
    // Only default to localhost:8080 if running locally in browser
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'
    );
    if (isLocalhost) {
      return 'http://localhost:8080';
    }
    // In production (Vercel, etc.), default to origin or relative API paths
    return window.location.origin;
  }
  return 'http://localhost:8080';
};

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    // Dynamically assign base URL before each request
    config.baseURL = getGatewayUrl();

    // Only attach Bearer header if authToken is a valid JWT (contains dots)
    if (authToken && typeof authToken === 'string' && authToken.includes('.')) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

