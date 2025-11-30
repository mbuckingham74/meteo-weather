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

  /**
   * Format a temperature value with the current unit
   * API returns temperatures in Celsius (metric), so we convert to F when needed
   * @param {number} temp - Temperature in Celsius (API default: metric)
   * @returns {string} Formatted temperature with unit symbol
   */
  const formatTemperature = useCallback(
    (temp) => {
      if (temp == null || isNaN(temp)) return '--°';
      // API returns Celsius, convert to Fahrenheit if unit is F
      const value = unit === 'F' ? (temp * 9) / 5 + 32 : temp;
      return `${Math.round(value)}°${unit}`;
    },
    [unit]
  );

  /**
   * Convert a temperature value to the current unit (returns number, not string)
   * Useful for charts where we need numeric values
   * @param {number} temp - Temperature in Celsius (API default: metric)
   * @returns {number} Temperature in current unit
   */
  const convertTemperature = useCallback(
    (temp) => {
      if (temp == null || isNaN(temp)) return null;
      return unit === 'F' ? (temp * 9) / 5 + 32 : temp;
    },
    [unit]
  );

  const value = {
    unit,
    setUnit,
    toggleUnit,
    loading,
    formatTemperature,
    convertTemperature,
  };

  return (
    <TemperatureUnitContext.Provider value={value}>{children}</TemperatureUnitContext.Provider>
  );
}
