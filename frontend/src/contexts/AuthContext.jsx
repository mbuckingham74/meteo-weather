import { createContext, useState, useContext, useEffect } from 'react';
import {
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  getCurrentUser,
  logoutUser as apiLogoutUser,
  refreshAccessToken,
} from '../services/authApi';

/**
 * Authentication Context
 * Manages user authentication state and provides auth functions
 */

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedAccessToken) {
          // Try to fetch user profile
          try {
            const userData = await getCurrentUser(storedAccessToken);
            setUser(userData);
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
          } catch (error) {
            // Token might be expired, try to refresh
            if (storedRefreshToken) {
              try {
                const { accessToken: newAccessToken } =
                  await refreshAccessToken(storedRefreshToken);
                localStorage.setItem('accessToken', newAccessToken);

                const userData = await getCurrentUser(newAccessToken);
                setUser(userData);
                setAccessToken(newAccessToken);
                setRefreshToken(storedRefreshToken);
              } catch (refreshError) {
                // Refresh failed, clear tokens
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register new user
  const register = async (email, password, name) => {
    try {
      setError(null);
      const response = await apiRegisterUser(email, password, name);

      const {
        user: userData,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = response;

      // Store tokens
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      setUser(userData);
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);

      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await apiLoginUser(email, password);

      const {
        user: userData,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = response;

      // Store tokens
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      setUser(userData);
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);

      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      if (accessToken) {
        await apiLogoutUser(accessToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token: accessToken, // Alias for accessToken (used by AdminPanel)
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
