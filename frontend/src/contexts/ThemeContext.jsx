import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserPreferences, updateUserPreferences } from '../services/authApi';

/**
 * Theme Context
 * Manages theme state (light, dark, auto) and persistence
 */

const ThemeContext = createContext(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [themePreference, setThemePreference] = useState('auto'); // 'light', 'dark', 'auto'
  const [actualTheme, setActualTheme] = useState('light'); // Resolved theme: 'light' or 'dark'
  const [loading, setLoading] = useState(true);

  // Load theme preference function
  const loadThemePreference = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated && accessToken) {
        // Load from user preferences
        const preferences = await getUserPreferences(accessToken);
        if (preferences.theme) {
          setThemePreference(preferences.theme);
        }
      } else {
        // Load from localStorage
        const stored = localStorage.getItem('themePreference');
        if (stored) {
          setThemePreference(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken]);

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themePreference === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setActualTheme(e.matches ? 'dark' : 'light');
      };

      // Set initial value
      setActualTheme(mediaQuery.matches ? 'dark' : 'light');

      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Use explicit theme preference
      setActualTheme(themePreference);
    }
  }, [themePreference]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualTheme);
  }, [actualTheme]);

  const setTheme = async (newTheme) => {
    setThemePreference(newTheme);

    if (isAuthenticated && accessToken) {
      // Save to user preferences
      try {
        await updateUserPreferences(accessToken, { theme: newTheme });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    } else {
      // Save to localStorage
      localStorage.setItem('themePreference', newTheme);
    }
  };

  // Toggle between light and dark (ignores 'auto' for simplicity)
  const toggleTheme = () => {
    const newTheme = actualTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const value = {
    themePreference, // 'light', 'dark', 'auto'
    theme: actualTheme, // alias for convenience (matches what components expect)
    actualTheme, // 'light' or 'dark' (resolved)
    setTheme,
    toggleTheme, // convenience function to toggle
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
