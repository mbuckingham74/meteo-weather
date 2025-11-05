import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * LocationContext
 * Manages the selected location state across the application
 * Persists location to localStorage for page refresh persistence
 */

const LocationContext = createContext();
const CURRENT_LOCATION_KEY = 'meteo_current_location';
const DEFAULT_LOCATION = 'Seattle, WA'; // More neutral default location

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
        return parsed.address || parsed.location_name || DEFAULT_LOCATION;
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
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
    }
    return null;
  });

  const selectLocation = useCallback((locationObj) => {
    setLocation(locationObj.address || locationObj.location_name);
    setLocationData(locationObj);

    // Save to localStorage
    try {
      localStorage.setItem(CURRENT_LOCATION_KEY, JSON.stringify(locationObj));
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
