import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserPreferences, updateUserPreferences } from '../services/authApi';

/**
 * TemperatureUnit Context
 * Manages temperature unit preference (C or F) and persistence
 */

const TemperatureUnitContext = createContext(null);

export function useTemperatureUnit() {
  const context = useContext(TemperatureUnitContext);
  if (!context) {
    throw new Error('useTemperatureUnit must be used within a TemperatureUnitProvider');
  }
  return context;
}

export function TemperatureUnitProvider({ children }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [unit, setUnitState] = useState('F'); // 'C' or 'F' - Default: Fahrenheit
  const [loading, setLoading] = useState(true);

  // Load temperature unit preference
  const loadUnitPreference = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated && accessToken) {
        // Load from user preferences
        const preferences = await getUserPreferences(accessToken);
        if (preferences.temperature_unit) {
          setUnitState(preferences.temperature_unit);
        }
      } else {
        // Load from localStorage
        const stored = localStorage.getItem('temperatureUnit');
        if (stored && (stored === 'C' || stored === 'F')) {
          setUnitState(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load temperature unit preference:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken]);

  // Load preference on mount
  useEffect(() => {
    loadUnitPreference();
  }, [loadUnitPreference]);

  const setUnit = async (newUnit) => {
    setUnitState(newUnit);

    if (isAuthenticated && accessToken) {
      // Save to user preferences
      try {
        await updateUserPreferences(accessToken, { temperature_unit: newUnit });
      } catch (error) {
        console.error('Failed to save temperature unit preference:', error);
      }
    } else {
      // Save to localStorage
      localStorage.setItem('temperatureUnit', newUnit);
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === 'C' ? 'F' : 'C';
    setUnit(newUnit);
  };

  const value = {
    unit,
    setUnit,
    toggleUnit,
    loading,
  };

  return (
    <TemperatureUnitContext.Provider value={value}>{children}</TemperatureUnitContext.Provider>
  );
}
