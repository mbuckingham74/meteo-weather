/**
 * Centralized API Client
 * Single source of truth for all API requests to prevent URL inconsistencies
 * and provide unified error handling, auth, and request configuration.
 *
 * Features:
 * - Request deduplication (prevents duplicate in-flight requests)
 * - Automatic retry with exponential backoff
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
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxAttempts: 3, // Total attempts (initial + 2 retries)
  baseDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds
  retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Retryable HTTP status codes
  retryableErrors: ['NetworkError', 'TypeError', 'AbortError'], // Retryable error types
};

/**
 * Calculate delay for exponential backoff with jitter
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {number} Delay in milliseconds
 */
function calculateBackoffDelay(attempt) {
  // Exponential backoff: delay = baseDelay * 2^attempt
  const exponentialDelay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);

  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, RETRY_CONFIG.maxDelay);

  // Add jitter (randomize ±25% to prevent thundering herd)
  const jitter = cappedDelay * 0.25 * (Math.random() - 0.5);

  return Math.floor(cappedDelay + jitter);
}

/**
 * Check if an error is retryable
 * @param {Error|ApiError} error - Error to check
 * @param {string} method - HTTP method
 * @returns {boolean} True if error is retryable
 */
function isRetryableError(error, method) {
  // Only retry safe methods (GET, HEAD) by default
  // POST/PUT/DELETE could have side effects
  if (method !== 'GET' && method !== 'HEAD') {
    return false;
  }

  // Check if it's an ApiError with retryable status code
  if (error instanceof ApiError) {
    return RETRY_CONFIG.retryableStatusCodes.includes(error.status);
  }

  // Check if it's a network error
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true; // Network error
  }

  // Timeout errors are retryable
  if (error.name === 'AbortError') {
    return true;
  }

  return false;
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
 * Make an API request with automatic deduplication and retry
 * @param {string} endpoint - API endpoint (should start with /, e.g., '/admin/stats')
 * @param {Object} options - Fetch options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.headers - Additional headers
 * @param {boolean} options.skipAuth - Skip adding Authorization header (default: false)
 * @param {boolean} options.skipDedup - Skip request deduplication (default: false)
 * @param {boolean} options.skipRetry - Skip automatic retry (default: false)
 * @param {number} options.maxRetries - Maximum retry attempts (default: 2, total 3 attempts)
 * @param {AbortSignal} options.signal - AbortController signal for cancellation
 * @returns {Promise<Object>} Response data
 * @throws {ApiError} If request fails after all retries
 *
 * @example
 * // GET request with automatic retry
 * const data = await apiRequest('/admin/stats');
 *
 * @example
 * // POST request with body (no retry by default)
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
 *
 * @example
 * // Disable retry for critical requests
 * const data = await apiRequest('/critical-endpoint', { skipRetry: true });
 */
export async function apiRequest(endpoint, options = {}) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Build full URL using centralized config
  const url = `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;

  // Get auth token from localStorage (AuthContext stores as 'accessToken')
  const token = localStorage.getItem('accessToken');

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

    // Create and cache the request promise (with retry)
    const requestPromise = executeRequestWithRetry(
      url,
      fetchOptions,
      options.skipRetry,
      options.maxRetries
    ).finally(() => {
      // Remove from cache when complete (success or failure)
      inflightRequests.delete(requestKey);
    });

    inflightRequests.set(requestKey, requestPromise);
    return requestPromise;
  }

  // Execute request without deduplication (with retry)
  return executeRequestWithRetry(url, fetchOptions, options.skipRetry, options.maxRetries);
}

/**
 * Execute request with automatic retry logic
 * @param {string} url - Full URL
 * @param {Object} fetchOptions - Fetch options
 * @param {boolean} skipRetry - Skip retry logic
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} Response data
 * @throws {ApiError} If request fails after all retries
 */
async function executeRequestWithRetry(url, fetchOptions, skipRetry = false, maxRetries = 2) {
  const method = fetchOptions.method || 'GET';
  const maxAttempts = skipRetry ? 1 : maxRetries + 1;

  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Execute the request
      const data = await executeRequest(url, fetchOptions);

      // Success - return data
      if (attempt > 0) {
        console.info(
          `[API Client] Request succeeded after ${attempt} ${attempt === 1 ? 'retry' : 'retries'}`
        );
      }
      return data;
    } catch (error) {
      lastError = error;

      // Don't retry if we're on the last attempt
      if (attempt === maxAttempts - 1) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error, method)) {
        console.info(`[API Client] Error not retryable (method: ${method}, error: ${error.name})`);
        break;
      }

      // Calculate backoff delay
      const delay = calculateBackoffDelay(attempt);

      console.info(
        `[API Client] Retry ${attempt + 1}/${maxRetries} after ${delay}ms (${error.name}: ${error.message})`
      );

      // Wait before retrying
      await sleep(delay);

      // Continue to next attempt
    }
  }

  // All retries exhausted - throw the last error
  throw lastError;
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
