import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserPreferences, updateUserPreferences } from '../services/authApi';

/**
 * TemperatureUnit Context
 * Manages temperature unit preference (C or F) and persistence
 */

const TemperatureUnitContext = createContext(null);

// US state abbreviations for location detection
const US_STATE_ABBREVIATIONS = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
  'DC',
];

/**
 * Detect if a location address is in the United States
 * @param {string} address - Location address string
 * @returns {boolean} True if location appears to be in the US
 */
function isUSLocation(address) {
  if (!address || typeof address !== 'string') return false;

  const addressUpper = address.toUpperCase();

  // Check for explicit US mentions
  if (
    addressUpper.includes('UNITED STATES') ||
    addressUpper.includes('USA') ||
    addressUpper.includes(', US')
  ) {
    return true;
  }

  // Check for US state abbreviations (must be a word boundary, e.g., "FL" not "FLORIDA")
  // Match patterns like "City, FL" or "City, FL 12345" or "State, FL, US"
  const statePattern = new RegExp(`[,\\s](${US_STATE_ABBREVIATIONS.join('|')})(\\s|,|$|\\d)`, 'i');
  return statePattern.test(address);
}

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
   * Set temperature unit based on location (US = Fahrenheit, others = Celsius)
   * Only sets if user hasn't explicitly saved a preference
   * @param {string} address - Location address string
   */
  const setUnitBasedOnLocation = useCallback((address) => {
    // Only auto-set if no stored preference exists
    const storedUnit = localStorage.getItem('temperatureUnit');
    if (storedUnit) {
      return; // User has explicit preference, don't override
    }

    const shouldUseFahrenheit = isUSLocation(address);
    setUnitState(shouldUseFahrenheit ? 'F' : 'C');
  }, []);

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
    setUnitBasedOnLocation,
    loading,
    formatTemperature,
    convertTemperature,
  };

  return (
    <TemperatureUnitContext.Provider value={value}>{children}</TemperatureUnitContext.Provider>
  );
}
