import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  loadVersionedData,
  saveVersionedData,
  clearVersionedData,
  getMigrationInfo,
} from '../utils/localStorageVersion';

/**
 * LocationContext
 * Manages the selected location state across the application
 * Persists location to localStorage with versioning for safe data migration
 *
 * Version 2 (Nov 6, 2025):
 * - Added version field to prevent "Old Location" bug from cached data
 * - Automatic migration from v1 (pre-versioned) data
 * - Sanitizes placeholder strings ("Your Location", "Old Location", etc.)
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

  // Check for known placeholder values from API or cached UI strings
  // CRITICAL: "Your Location" can be cached in old localStorage data and must be replaced
  if (/^(old location|your location|location|unknown|coordinates?|unnamed)$/i.test(trimmed)) {
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
  // Log migration status on mount (development only)
  if (process.env.NODE_ENV === 'development') {
    const migrationInfo = getMigrationInfo();
    if (migrationInfo.needsMigration) {
      console.log(
        `📦 localStorage migration needed: v${migrationInfo.currentVersion} → v${migrationInfo.expectedVersion}`
      );
    } else if (migrationInfo.isUpToDate) {
      console.log(`✅ localStorage is up to date (v${migrationInfo.currentVersion})`);
    }
  }

  // Initialize state from versioned localStorage
  const [location, setLocation] = useState(() => {
    try {
      // Load with automatic migration
      const data = loadVersionedData(CURRENT_LOCATION_KEY);
      if (data) {
        const sanitized = sanitizeLocationData(data);
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
      // Load with automatic migration
      const data = loadVersionedData(CURRENT_LOCATION_KEY);
      if (data) {
        return sanitizeLocationData(data);
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

    // Save with version stamp
    const success = saveVersionedData(CURRENT_LOCATION_KEY, sanitized);
    if (success) {
      console.log('📍 Saved location to localStorage (v2):', sanitized.address);
    } else {
      console.error('Error saving location to localStorage');
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(DEFAULT_LOCATION);
    setLocationData(null);

    // Clear versioned data
    clearVersionedData(CURRENT_LOCATION_KEY);
  }, []);

  const value = {
    location,
    locationData,
    selectLocation,
    clearLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
