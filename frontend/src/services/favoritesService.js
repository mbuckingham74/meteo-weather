/**
 * Favorites Service
 * Manages favorite locations using browser localStorage
 * (Can be upgraded to API-based storage when authentication is added)
 */

const STORAGE_KEY = 'meteo_favorites';

/**
 * Get all favorite locations
 * @returns {Array} Array of favorite locations
 */
export function getFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
}

/**
 * Add a location to favorites
 * @param {Object} location - Location object with address, latitude, longitude
 * @returns {boolean} Success status
 */
export function addFavorite(location) {
  try {
    const favorites = getFavorites();

    // Check if already in favorites
    const exists = favorites.some(
      (fav) => fav.latitude === location.latitude && fav.longitude === location.longitude
    );

    if (exists) {
      return false;
    }

    // Add to favorites with timestamp
    const newFavorite = {
      ...location,
      addedAt: new Date().toISOString(),
      id: `${location.latitude},${location.longitude}`,
    };

    favorites.push(newFavorite);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));

    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
}

/**
 * Remove a location from favorites
 * @param {string} locationId - Location ID (lat,lon)
 * @returns {boolean} Success status
 */
export function removeFavorite(locationId) {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter((fav) => fav.id !== locationId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
}

/**
 * Check if a location is in favorites
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {boolean} True if in favorites
 */
export function isFavorite(latitude, longitude) {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.latitude === latitude && fav.longitude === longitude);
}

/**
 * Clear all favorites
 * @returns {boolean} Success status
 */
export function clearFavorites() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
}

/**
 * Reorder favorites
 * @param {Array} newOrder - Array of favorite locations in new order
 * @returns {boolean} Success status
 */
export function reorderFavorites(newOrder) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
    return true;
  } catch (error) {
    console.error('Error reordering favorites:', error);
    return false;
  }
}
