import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * LocationContext
 * Manages the selected location state across the application
 * Persists location to localStorage for page refresh persistence
 */

const LocationContext = createContext();
const CURRENT_LOCATION_KEY = 'meteo_current_location';
const DEFAULT_LOCATION = 'Seattle, WA'; // More neutral default location

/**
 * Check if an address is a placeholder value that should be replaced
 * @param {string} address - Address to check
 * @returns {boolean} - True if address is a placeholder
 */
function isPlaceholderAddress(address) {
  if (!address || typeof address !== 'string') return true;

  // Check for placeholder patterns
  const trimmed = address.trim();
  if (trimmed === '') return true;

  // Check for known placeholder values from API
  if (/^(old location|location|unknown|coordinates?|unnamed)$/i.test(trimmed)) {
    return true;
  }

  // NOTE: Do NOT treat coordinates as placeholders!
  // The weather API needs coordinates when we don't have a city name
  // If it's coordinates, it's valid data, not a placeholder

  return false;
}

/**
 * Sanitize location data loaded from localStorage
 * Replaces placeholder addresses with coordinates or "Your Location"
 * @param {Object} locationObj - Location object from localStorage
 * @returns {Object} - Sanitized location object
 */
function sanitizeLocationData(locationObj) {
  if (!locationObj) return null;

  const address = locationObj.address || locationObj.location_name;

  // If address is a placeholder, replace it with coordinates (NOT "Your Location")
  // The weather API needs actual coordinates to work
  if (isPlaceholderAddress(address)) {
    const hasCoords = locationObj.latitude != null && locationObj.longitude != null;

    if (hasCoords) {
      // Return coordinates for API to use
      return {
        ...locationObj,
        address: `${locationObj.latitude.toFixed(4)}, ${locationObj.longitude.toFixed(4)}`,
      };
    } else {
      // No coordinates available, this shouldn't happen but return null to trigger default
      console.warn('Location has placeholder address and no coordinates');
      return null;
    }
  }

  return locationObj;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export function LocationProvider({ children }) {
  // Initialize state from localStorage if available
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(CURRENT_LOCATION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = sanitizeLocationData(parsed);
        if (sanitized) {
          return sanitized.address || sanitized.location_name || DEFAULT_LOCATION;
        }
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
    }
    return DEFAULT_LOCATION;
  });

  const [locationData, setLocationData] = useState(() => {
    try {
      const saved = localStorage.getItem(CURRENT_LOCATION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeLocationData(parsed);
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
    }
    return null;
  });

  const selectLocation = useCallback((locationObj) => {
    // Sanitize before setting state and saving
    const sanitized = sanitizeLocationData(locationObj) || locationObj;

    setLocation(sanitized.address || sanitized.location_name);
    setLocationData(sanitized);

    // Save sanitized version to localStorage
    try {
      localStorage.setItem(CURRENT_LOCATION_KEY, JSON.stringify(sanitized));
      console.log('📍 Saved location to localStorage:', sanitized.address);
    } catch (error) {
      console.error('Error saving location to localStorage:', error);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(DEFAULT_LOCATION);
    setLocationData(null);

    // Clear from localStorage
    try {
      localStorage.removeItem(CURRENT_LOCATION_KEY);
    } catch (error) {
      console.error('Error clearing location from localStorage:', error);
    }
  }, []);

  const value = {
    location,
    locationData,
    selectLocation,
    clearLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
