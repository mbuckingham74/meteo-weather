import { apiRequest, ApiError } from './apiClient';
import { handleAPIError, ERROR_CODES, AppError } from '../utils/errorHandler';
import { debugInfo, debugError } from '../utils/debugLogger';

/**
 * Authentication API Service
 * Handles all auth-related API calls using centralized apiClient
 *
 * All functions use:
 * - Centralized API client for consistency
 * - Timeout protection (5s for auth operations)
 * - User-friendly error messages with specific guidance
 * - Token expiration detection
 */

// Auth timeout (5 seconds - faster than weather data)
const AUTH_TIMEOUT = 5000;

/**
 * Helper to make API requests with auth-specific timeout and error handling
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {Object} options - API request options
 * @param {string} context - Error context for debugging
 * @returns {Promise<Object>} Response data
 */
async function authRequest(endpoint, options = {}, context = 'API Request') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT);

  try {
    debugInfo('Auth API', context);

    const data = await apiRequest(endpoint, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    debugInfo('Auth API', `${context} - Success`);
    return data;
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

    // Handle ApiError from apiClient
    if (error instanceof ApiError) {
      // Map status codes to error codes
      let errorCode = ERROR_CODES.API_ERROR;
      let recoverable = true;

      if (error.status === 401) {
        errorCode = ERROR_CODES.TOKEN_EXPIRED;
        recoverable = false; // User must log in again
      } else if (error.status === 403) {
        errorCode = ERROR_CODES.UNAUTHORIZED;
        recoverable = false;
      } else if (error.status === 404) {
        errorCode = ERROR_CODES.DATA_NOT_FOUND;
      } else if (error.status === 422) {
        errorCode = ERROR_CODES.VALIDATION_ERROR;
      } else if (error.status === 429) {
        errorCode = ERROR_CODES.RATE_LIMITED;
      } else if (error.status >= 500) {
        errorCode = ERROR_CODES.SERVER_ERROR;
      }

      debugError('Auth API', `${context} - ${error.status}: ${error.message}`);

      throw new AppError(error.message, errorCode, recoverable, {
        status: error.status,
        context,
      });
    }

    throw error;
  }
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
    return await authRequest(
      '/auth/register',
      {
        method: 'POST',
        body: { email, password, name },
        skipAuth: true,
      },
      'Registering new user'
    );
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
    return await authRequest(
      '/auth/login',
      {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
      },
      `Logging in user: ${email}`
    );
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
    const data = await authRequest('/auth/me', {}, 'Fetching user profile');
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
    const data = await authRequest(
      '/auth/profile',
      {
        method: 'PUT',
        body: updates,
      },
      'Updating user profile'
    );
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
    return await authRequest(
      '/auth/change-password',
      {
        method: 'POST',
        body: { currentPassword, newPassword },
      },
      'Changing password'
    );
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
    return await authRequest(
      '/auth/refresh',
      {
        method: 'POST',
        body: { refreshToken },
        skipAuth: true,
      },
      'Refreshing access token'
    );
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
    return await authRequest('/auth/logout', { method: 'POST' }, 'Logging out user');
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
    const data = await authRequest('/user/preferences', {}, 'Fetching user preferences');
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
    const data = await authRequest(
      '/user/preferences',
      {
        method: 'PUT',
        body: preferences,
      },
      'Updating user preferences'
    );
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
    const data = await authRequest('/user/favorites', {}, 'Fetching cloud favorites');
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
    const data = await authRequest(
      '/user/favorites',
      {
        method: 'POST',
        body: favorite,
      },
      `Adding favorite: ${favorite.location_name || favorite.address}`
    );
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
    return await authRequest(
      `/user/favorites/${favoriteId}`,
      {
        method: 'DELETE',
      },
      `Removing favorite ID: ${favoriteId}`
    );
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

    return await authRequest(
      '/user/favorites/import',
      {
        method: 'POST',
        body: { favorites },
      },
      `Importing ${favorites.length} favorites`
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleAPIError(error, 'Importing your favorites to the cloud');
  }
}
