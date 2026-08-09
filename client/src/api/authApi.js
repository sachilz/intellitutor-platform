import axios from 'axios';
import axiosInstance from './axiosInstance';

const KEYCLOAK_URL =
  import.meta.env.VITE_KEYCLOAK_URL ||
  import.meta.env.REACT_APP_KEYCLOAK_URL ||
  'http://localhost:8180';

const CLIENT_SECRET =
  import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET ||
  import.meta.env.REACT_APP_KEYCLOAK_CLIENT_SECRET ||
  '';

const USER_SERVICE_API_KEY = 'user-service-secret-key-123';

export const loginUser = async (usernameOrEmail, password) => {
  // 1. Try Keycloak ROPC Token endpoint
  try {
    const tokenEndpoint = `${KEYCLOAK_URL}/realms/intellilearn/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', 'intellilearn-gateway');
    if (CLIENT_SECRET && !CLIENT_SECRET.includes('placeholder')) {
      params.append('client_secret', CLIENT_SECRET);
    }
    params.append('username', usernameOrEmail);
    params.append('password', password);

    const response = await axios.post(tokenEndpoint, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (keycloakError) {
    // 2. Fallback to API Gateway / User Service login endpoint (for registered users saved in userdb)
    try {
      const gatewayResponse = await axiosInstance.post(
        '/api/auth/login',
        {
          email: usernameOrEmail,
          password: password,
        },
        {
          headers: {
            'X-API-KEY': USER_SERVICE_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      const userData = gatewayResponse.data;
      return {
        access_token: userData.apiKey || `token-${userData.id}`,
        user: userData,
      };
    } catch (gatewayError) {
      const message =
        gatewayError.response?.data?.message ||
        keycloakError.response?.data?.error_description ||
        'Invalid email or password.';
      throw new Error(message);
    }
  }
};

export const registerUser = async (userData) => {
  const response = await axiosInstance.post('/api/auth/register', userData, {
    headers: {
      'X-API-KEY': USER_SERVICE_API_KEY,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
