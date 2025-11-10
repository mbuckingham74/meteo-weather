import API_CONFIG from '../config/api';
import { handleAPIError, ERROR_CODES, AppError } from '../utils/errorHandler';
import { debugInfo, debugError } from '../utils/debugLogger';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Authentication API Service
 * Handles all auth-related API calls
 *
 * All functions use:
 * - Centralized error handling via errorHandler utility
 * - Timeout protection (5s for auth operations)
 * - User-friendly error messages with specific guidance
 * - Token expiration detection
 */

// Auth timeout (5 seconds - faster than weather data)
const AUTH_TIMEOUT = 5000;

/**
 * Helper to make authenticated fetch requests with timeout
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @param {string} context - Error context for debugging
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithTimeout(url, options = {}, context = 'API Request') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT);

  try {
    debugInfo('Auth API', context);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      debugError('Auth API', `${context} - Timeout after ${AUTH_TIMEOUT}ms`);
      throw new AppError(
        'Request timed out. Please check your connection and try again.',
        ERROR_CODES.TIMEOUT_ERROR,
        true,
        { context }
      );
    }

    throw error;
  }
}

/**
 * Process API response and throw appropriate errors
 * @param {Response} response - Fetch response
 * @param {string} context - Error context
 * @returns {Promise<Object>} Response data
 */
async function handleResponse(response, context) {
  const data = await response.json();

  if (!response.ok) {
    // Map status codes to error codes
    let errorCode = ERROR_CODES.API_ERROR;
    let recoverable = true;

    if (response.status === 401) {
      errorCode = ERROR_CODES.TOKEN_EXPIRED;
      recoverable = false; // User must log in again
    } else if (response.status === 403) {
      errorCode = ERROR_CODES.UNAUTHORIZED;
      recoverable = false;
    } else if (response.status === 404) {
      errorCode = ERROR_CODES.DATA_NOT_FOUND;
    } else if (response.status === 422) {
      errorCode = ERROR_CODES.VALIDATION_ERROR;
    } else if (response.status === 429) {
      errorCode = ERROR_CODES.RATE_LIMITED;
    } else if (response.status >= 500) {
      errorCode = ERROR_CODES.SERVER_ERROR;
    }

    debugError('Auth API', `${context} - ${response.status}: ${data.error || 'Unknown error'}`);

    throw new AppError(data.error || `Failed: ${context}`, errorCode, recoverable, {
      status: response.status,
      context,
    });
  }

  debugInfo('Auth API', `${context} - Success`);
  return data;
}

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name
 * @returns {Promise<Object>} Registration response with tokens
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function registerUser(email, password, name) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      },
      'Registering new user'
    );

    return await handleResponse(response, 'Registration');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Registering your account');
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response with tokens
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function loginUser(email, password) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
      `Logging in user: ${email}`
    );

    return await handleResponse(response, 'Login');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Logging in');
  }
}

/**
 * Get current user profile
 * @param {string} accessToken - JWT access token
 * @returns {Promise<Object>} User profile
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getCurrentUser(accessToken) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      'Fetching user profile'
    );

    const data = await handleResponse(response, 'Get user profile');
    return data.user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Loading your profile');
  }
}

/**
 * Update user profile
 * @param {string} accessToken - JWT access token
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated user profile
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function updateUserProfile(accessToken, updates) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/profile`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      },
      'Updating user profile'
    );

    const data = await handleResponse(response, 'Update profile');
    return data.user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Updating your profile');
  }
}

/**
 * Change user password
 * @param {string} accessToken - JWT access token
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success response
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function changePassword(accessToken, currentPassword, newPassword) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/change-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      },
      'Changing password'
    );

    return await handleResponse(response, 'Change password');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Changing your password');
  }
}

/**
 * Refresh access token
 * @param {string} refreshToken - JWT refresh token
 * @returns {Promise<Object>} New access token
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      },
      'Refreshing access token'
    );

    return await handleResponse(response, 'Refresh token');
  } catch (error) {
    if (error instanceof AppError) {
      // Special handling for expired refresh tokens
      if (error.code === ERROR_CODES.TOKEN_EXPIRED) {
        throw new AppError(
          'Your session has expired. Please log in again to continue.',
          ERROR_CODES.TOKEN_EXPIRED,
          false // Not recoverable - must log in again
        );
      }
      throw error;
    }
    throw handleAPIError(error, 'Refreshing your session');
  }
}

/**
 * Logout user
 * @param {string} accessToken - JWT access token
 * @returns {Promise<Object>} Logout confirmation
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function logoutUser(accessToken) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/logout`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      'Logging out user'
    );

    return await handleResponse(response, 'Logout');
  } catch (error) {
    // Logout failures are not critical - user is trying to leave anyway
    debugError('Auth API', 'Logout failed but will continue', error);
    // Return success even if API call failed
    return { success: true, message: 'Logged out (local only)' };
  }
}

/**
 * Get user preferences
 * @param {string} accessToken - JWT access token
 * @returns {Promise<Object>} User preferences
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getUserPreferences(accessToken) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/user/preferences`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      'Fetching user preferences'
    );

    const data = await handleResponse(response, 'Get preferences');
    return data.preferences;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Loading your preferences');
  }
}

/**
 * Update user preferences
 * @param {string} accessToken - JWT access token
 * @param {Object} preferences - Updated preferences
 * @returns {Promise<Object>} Updated preferences
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function updateUserPreferences(accessToken, preferences) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/user/preferences`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferences),
      },
      'Updating user preferences'
    );

    const data = await handleResponse(response, 'Update preferences');
    return data.preferences;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Saving your preferences');
  }
}

/**
 * Get cloud favorites
 * @param {string} accessToken - JWT access token
 * @returns {Promise<Array>} User favorites
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function getCloudFavorites(accessToken) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/user/favorites`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      'Fetching cloud favorites'
    );

    const data = await handleResponse(response, 'Get favorites');
    return data.favorites;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Loading your favorites');
  }
}

/**
 * Add favorite to cloud
 * @param {string} accessToken - JWT access token
 * @param {Object} favorite - Favorite location data
 * @returns {Promise<Object>} Added favorite
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function addCloudFavorite(accessToken, favorite) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/user/favorites`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(favorite),
      },
      `Adding favorite: ${favorite.location_name || favorite.address}`
    );

    const data = await handleResponse(response, 'Add favorite');
    return data.favorite;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Adding location to favorites');
  }
}

/**
 * Remove favorite from cloud
 * @param {string} accessToken - JWT access token
 * @param {number} favoriteId - Favorite ID to remove
 * @returns {Promise<Object>} Removal confirmation
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function removeCloudFavorite(accessToken, favoriteId) {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/user/favorites/${favoriteId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      `Removing favorite ID: ${favoriteId}`
    );

    return await handleResponse(response, 'Remove favorite');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Removing location from favorites');
  }
}

/**
 * Import favorites from localStorage to cloud
 * @param {string} accessToken - JWT access token
 * @param {Array} favorites - Array of favorite locations
 * @returns {Promise<Object>} Import results
 * @throws {AppError} User-friendly error with recovery guidance
 */
export async function importFavorites(accessToken, favorites) {
  try {
    debugInfo('Auth API', `Importing ${favorites.length} favorites to cloud`);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/user/favorites/import`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ favorites }),
      },
      `Importing ${favorites.length} favorites`
    );

    return await handleResponse(response, 'Import favorites');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Importing your favorites to the cloud');
  }
}
