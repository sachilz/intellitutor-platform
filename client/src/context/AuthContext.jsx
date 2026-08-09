import React, { createContext, useState, useContext } from 'react';
import { loginUser as loginApi, registerUser as registerApi } from '../api/authApi';
import { setAuthToken } from '../api/axiosInstance';

const AuthContext = createContext();

export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      const data = await loginApi(usernameOrEmail, password);
      const accessToken = data.access_token;

      setToken(accessToken);
      setAuthToken(accessToken);

      let userInfo = null;
      if (data.user) {
        userInfo = {
          id: data.user.id,
          username: data.user.name || data.user.email,
          email: data.user.email,
          roles: [data.user.role || 'STUDENT'],
        };
      } else {
        const decoded = parseJwt(accessToken);
        userInfo = {
          id: decoded?.sub || usernameOrEmail,
          username: decoded?.preferred_username || usernameOrEmail,
          email: decoded?.email || usernameOrEmail,
          roles: decoded?.realm_access?.roles || [],
        };
      }

      setUser(userInfo);
      setLoading(false);
      return userInfo;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await registerApi(userData);
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
