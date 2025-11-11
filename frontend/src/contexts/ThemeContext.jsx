import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserPreferences, updateUserPreferences } from '../services/authApi';

/**
 * Theme Context
 * Manages theme state (light, dark, auto) and persistence
 */

const ThemeContext = createContext(null);

const SUPPORTED_THEMES = ['light', 'dark', 'aurora', 'sunset'];
const AUTO_THEME = 'auto';
const FALLBACK_THEME = 'light';

const normalizeTheme = (value) => {
  if (value === AUTO_THEME) {
    return AUTO_THEME;
  }
  if (value && SUPPORTED_THEMES.includes(value)) {
    return value;
  }
  return FALLBACK_THEME;
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [themePreference, setThemePreference] = useState(AUTO_THEME);
  const [actualTheme, setActualTheme] = useState(FALLBACK_THEME);
  const [loading, setLoading] = useState(true);

  // Load theme preference function
  const loadThemePreference = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated && accessToken) {
        // Load from user preferences
        const preferences = await getUserPreferences(accessToken);
        if (preferences.theme) {
          setThemePreference(normalizeTheme(preferences.theme));
        }
      } else {
        // Load from localStorage
        const stored = localStorage.getItem('themePreference');
        if (stored) {
          setThemePreference(normalizeTheme(stored));
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
    if (themePreference === AUTO_THEME) {
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
      setActualTheme(SUPPORTED_THEMES.includes(themePreference) ? themePreference : FALLBACK_THEME);
    }
  }, [themePreference]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualTheme);
  }, [actualTheme]);

  const setTheme = async (newTheme) => {
    const normalized = normalizeTheme(newTheme);
    setThemePreference(normalized);

    if (isAuthenticated && accessToken) {
      // Save to user preferences
      try {
        await updateUserPreferences(accessToken, { theme: normalized });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    } else {
      // Save to localStorage
      localStorage.setItem('themePreference', normalized);
    }
  };

  const value = {
    themePreference, // 'light', 'dark', 'auto'
    actualTheme, // 'light' or 'dark' (resolved)
    setTheme,
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
