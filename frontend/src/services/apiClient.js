/**
 * Centralized API Client
 * Single source of truth for all API requests to prevent URL inconsistencies
 * and provide unified error handling, auth, and request configuration.
 */

import API_CONFIG from '../config/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (should start with /, e.g., '/admin/stats')
 * @param {Object} options - Fetch options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.headers - Additional headers
 * @param {boolean} options.skipAuth - Skip adding Authorization header (default: false)
 * @param {AbortSignal} options.signal - AbortController signal for cancellation
 * @returns {Promise<Object>} Response data
 * @throws {ApiError} If request fails
 *
 * @example
 * // GET request
 * const data = await apiRequest('/admin/stats');
 *
 * @example
 * // POST request with body
 * const result = await apiRequest('/api-keys', {
 *   method: 'POST',
 *   body: { provider: 'anthropic', keyName: 'My Key', apiKey: 'sk-...' }
 * });
 *
 * @example
 * // DELETE request
 * await apiRequest(`/api-keys/${keyId}`, { method: 'DELETE' });
 */
export async function apiRequest(endpoint, options = {}) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Build full URL using centralized config
  const url = `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;

  // Get auth token from localStorage
  const token = localStorage.getItem('token');

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth header unless explicitly skipped
  if (!options.skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Build fetch options
  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    signal: options.signal,
  };

  // Add body if present (and not GET/HEAD)
  if (options.body && fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Check for errors
    if (!response.ok) {
      const errorMessage = data?.error || data?.message || response.statusText || 'Request failed';
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error.name === 'AbortError') {
      throw new ApiError('Request cancelled', 0);
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('Network error - check your connection', 0);
    }

    // Wrap other errors
    throw new ApiError(error.message || 'Unknown error occurred', 0);
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'POST', body }),

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body }),

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PATCH', body }),

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
