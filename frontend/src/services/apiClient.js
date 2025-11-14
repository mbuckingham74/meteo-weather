/**
 * Centralized API Client
 * Single source of truth for all API requests to prevent URL inconsistencies
 * and provide unified error handling, auth, and request configuration.
 *
 * Features:
 * - Request deduplication (prevents duplicate in-flight requests)
 * - Automatic auth header handling
 * - Unified error handling with ApiError class
 * - AbortController support for cancellation
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
 * Request deduplication cache
 * Maps request keys to in-flight promises
 */
const inflightRequests = new Map();

/**
 * Generate a unique cache key for request deduplication
 * @param {string} url - Full URL
 * @param {Object} fetchOptions - Fetch options
 * @returns {string} Cache key
 */
function getRequestKey(url, fetchOptions) {
  const method = fetchOptions.method || 'GET';
  const body = fetchOptions.body || '';
  return `${method}:${url}:${body}`;
}

/**
 * Make an API request with automatic deduplication
 * @param {string} endpoint - API endpoint (should start with /, e.g., '/admin/stats')
 * @param {Object} options - Fetch options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.headers - Additional headers
 * @param {boolean} options.skipAuth - Skip adding Authorization header (default: false)
 * @param {boolean} options.skipDedup - Skip request deduplication (default: false)
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
 *
 * @example
 * // Skip deduplication for time-sensitive requests
 * const data = await apiRequest('/weather/current', { skipDedup: true });
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

  // Request deduplication (skip for mutations by default, or if explicitly requested)
  const shouldDeduplicate =
    !options.skipDedup && (fetchOptions.method === 'GET' || fetchOptions.method === 'HEAD');

  if (shouldDeduplicate) {
    const requestKey = getRequestKey(url, fetchOptions);

    // Return existing promise if request is already in-flight
    if (inflightRequests.has(requestKey)) {
      return inflightRequests.get(requestKey);
    }

    // Create and cache the request promise
    const requestPromise = executeRequest(url, fetchOptions).finally(() => {
      // Remove from cache when complete (success or failure)
      inflightRequests.delete(requestKey);
    });

    inflightRequests.set(requestKey, requestPromise);
    return requestPromise;
  }

  // Execute request without deduplication
  return executeRequest(url, fetchOptions);
}

/**
 * Execute the actual fetch request (internal helper)
 * @param {string} url - Full URL
 * @param {Object} fetchOptions - Fetch options
 * @returns {Promise<Object>} Response data
 * @throws {ApiError} If request fails
 */
async function executeRequest(url, fetchOptions) {
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
