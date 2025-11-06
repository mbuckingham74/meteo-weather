/**
 * Error Handling Utility
 * Centralized error management with user-friendly messages and error codes
 */

import { useState } from 'react';
import { debugError } from './debugLogger';

/**
 * Application Error Codes
 */
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',

  // API errors
  RATE_LIMITED: 'RATE_LIMITED',
  API_ERROR: 'API_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',

  // Location errors
  INVALID_LOCATION: 'INVALID_LOCATION',
  LOCATION_NOT_FOUND: 'LOCATION_NOT_FOUND',
  GEOLOCATION_DENIED: 'GEOLOCATION_DENIED',
  GEOLOCATION_UNAVAILABLE: 'GEOLOCATION_UNAVAILABLE',

  // Authentication errors
  AUTH_FAILED: 'AUTH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Data errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',

  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
};

/**
 * Application Error Class
 * Extends Error with additional context for better handling
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} code - Error code from ERROR_CODES
   * @param {boolean} recoverable - Whether user can retry/recover from this error
   * @param {Object} context - Additional context about the error
   */
  constructor(message, code = ERROR_CODES.UNKNOWN_ERROR, recoverable = true, context = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.recoverable = recoverable;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * User-friendly error messages mapped to error codes
 */
const USER_MESSAGES = {
  // Network errors
  [ERROR_CODES.NETWORK_ERROR]:
    'Network error. Please check your internet connection and try again.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. The server took too long to respond.',
  [ERROR_CODES.CONNECTION_ERROR]: 'Unable to connect to the server. Please try again later.',

  // API errors
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please wait a moment before trying again.',
  [ERROR_CODES.API_ERROR]: 'An error occurred while fetching data. Please try again.',
  [ERROR_CODES.INVALID_RESPONSE]: 'Received invalid data from server. Please try again.',

  // Location errors
  [ERROR_CODES.INVALID_LOCATION]: 'Invalid location. Please check the spelling and try again.',
  [ERROR_CODES.LOCATION_NOT_FOUND]: 'Location not found. Try a different city or zip code.',
  [ERROR_CODES.GEOLOCATION_DENIED]:
    'Location access denied. Please enable location services or search manually.',
  [ERROR_CODES.GEOLOCATION_UNAVAILABLE]:
    'Location unavailable. Please search for a location manually.',

  // Authentication errors
  [ERROR_CODES.AUTH_FAILED]: 'Authentication failed. Please check your credentials.',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Session expired. Please log in again.',
  [ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action.',

  // Data errors
  [ERROR_CODES.VALIDATION_ERROR]: 'Invalid input. Please check your data and try again.',
  [ERROR_CODES.PARSE_ERROR]: 'Unable to process data. Please try again.',
  [ERROR_CODES.DATA_NOT_FOUND]: 'No data available for this location or time period.',

  // Generic errors
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ERROR_CODES.SERVER_ERROR]: 'Server error. Please try again later.',
};

/**
 * Get user-friendly message for an error
 * @param {Error|AppError} error - Error object
 * @returns {string} - User-friendly error message
 */
export function getUserMessage(error) {
  if (error instanceof AppError) {
    return USER_MESSAGES[error.code] || error.message || USER_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  }

  // Handle standard Error objects
  if (error.message) {
    return error.message;
  }

  return USER_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
}

/**
 * Map HTTP status codes to error codes
 * @param {number} status - HTTP status code
 * @returns {string} - Error code
 */
export function getErrorCodeFromStatus(status) {
  if (status === 429) return ERROR_CODES.RATE_LIMITED;
  if (status === 401) return ERROR_CODES.UNAUTHORIZED;
  if (status === 403) return ERROR_CODES.UNAUTHORIZED;
  if (status === 404) return ERROR_CODES.DATA_NOT_FOUND;
  if (status >= 500) return ERROR_CODES.SERVER_ERROR;
  if (status >= 400) return ERROR_CODES.API_ERROR;
  return ERROR_CODES.UNKNOWN_ERROR;
}

/**
 * Handle API errors and convert to AppError
 * @param {Error} error - Error from API call
 * @param {string} context - Context about where error occurred
 * @returns {AppError} - Standardized error
 */
export function handleAPIError(error, context = 'API') {
  // Network errors
  if (error.message === 'Network Error' || error.code === 'ENOTFOUND') {
    debugError(context, { type: 'network', error: error.message });
    return new AppError(
      getUserMessage({ code: ERROR_CODES.NETWORK_ERROR }),
      ERROR_CODES.NETWORK_ERROR,
      true,
      { originalError: error.message }
    );
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    debugError(context, { type: 'timeout', error: error.message });
    return new AppError(
      getUserMessage({ code: ERROR_CODES.TIMEOUT_ERROR }),
      ERROR_CODES.TIMEOUT_ERROR,
      true,
      { originalError: error.message }
    );
  }

  // HTTP errors with response
  if (error.response) {
    const status = error.response.status;
    const code = getErrorCodeFromStatus(status);
    debugError(context, { type: 'http', status, code, data: error.response.data });

    return new AppError(
      error.response.data?.message || getUserMessage({ code }),
      code,
      code !== ERROR_CODES.UNAUTHORIZED,
      {
        status,
        data: error.response.data,
      }
    );
  }

  // Generic error
  debugError(context, { type: 'unknown', error: error.message });
  return new AppError(
    error.message || getUserMessage({ code: ERROR_CODES.UNKNOWN_ERROR }),
    ERROR_CODES.UNKNOWN_ERROR,
    true,
    { originalError: error.message }
  );
}

/**
 * Handle geolocation errors
 * @param {Error} error - Geolocation error
 * @returns {AppError} - Standardized error
 */
export function handleGeolocationError(error) {
  if (error.code === 1) {
    // PERMISSION_DENIED
    return new AppError(
      getUserMessage({ code: ERROR_CODES.GEOLOCATION_DENIED }),
      ERROR_CODES.GEOLOCATION_DENIED,
      false
    );
  }

  if (error.code === 2) {
    // POSITION_UNAVAILABLE
    return new AppError(
      getUserMessage({ code: ERROR_CODES.GEOLOCATION_UNAVAILABLE }),
      ERROR_CODES.GEOLOCATION_UNAVAILABLE,
      true
    );
  }

  if (error.code === 3) {
    // TIMEOUT
    return new AppError(
      getUserMessage({ code: ERROR_CODES.TIMEOUT_ERROR }),
      ERROR_CODES.TIMEOUT_ERROR,
      true
    );
  }

  return new AppError(
    error.message || getUserMessage({ code: ERROR_CODES.GEOLOCATION_UNAVAILABLE }),
    ERROR_CODES.GEOLOCATION_UNAVAILABLE,
    true
  );
}

/**
 * React hook for error state management
 * @example
 * const { error, setError, clearError, handleError } = useErrorHandler();
 */
export function useErrorHandler() {
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const handleError = (err, context = 'Application') => {
    const appError = err instanceof AppError ? err : handleAPIError(err, context);
    setError(appError);
    return appError;
  };

  return {
    error,
    setError,
    clearError,
    handleError,
    hasError: error !== null,
    errorMessage: error ? getUserMessage(error) : null,
    isRecoverable: error ? error.recoverable : true,
  };
}

/**
 * Error retry utility with progress tracking
 * Retries a function with exponential backoff and optional progress callbacks
 *
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in ms before first retry
 * @param {string} context - Context for logging
 * @param {Object} options - Additional options
 * @param {Function} options.onRetry - Callback when retry starts (attempt, maxRetries, delay)
 * @param {Function} options.onSuccess - Callback when operation succeeds (attempt)
 * @param {Function} options.onFailure - Callback when all retries fail (error, attempts)
 * @returns {Promise} Result of fn()
 *
 * @example
 * const result = await retryWithBackoff(
 *   async () => fetch('/api/data'),
 *   3,
 *   1000,
 *   'API Call',
 *   {
 *     onRetry: (attempt, max, delay) => {
 *       console.log(`Retrying... (${attempt} of ${max})`);
 *     }
 *   }
 * );
 */
export async function retryWithBackoff(
  fn,
  maxRetries = 3,
  initialDelay = 1000,
  context = 'Retry',
  options = {}
) {
  const { onRetry, onSuccess, onFailure } = options;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fn();

      // Success callback
      if (onSuccess && i > 0) {
        onSuccess(i);
      }

      return result;
    } catch (error) {
      lastError = error;
      debugError(context, {
        attempt: i + 1,
        maxRetries,
        error: error.message,
      });

      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);

        // Retry callback
        if (onRetry) {
          onRetry(i + 1, maxRetries, delay);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Failure callback
  if (onFailure) {
    onFailure(lastError, maxRetries);
  }

  throw lastError;
}

/**
 * React hook for retry state management with UI indicators
 * Provides retry progress tracking for displaying to users
 *
 * @example
 * const { retryState, executeWithRetry, resetRetry } = useRetryHandler();
 *
 * <button onClick={() => executeWithRetry(fetchData)}>
 *   {retryState.isRetrying ? `Retrying (${retryState.attempt}/${retryState.maxAttempts})...` : 'Load Data'}
 * </button>
 */
export function useRetryHandler(maxRetries = 3, initialDelay = 1000) {
  const [retryState, setRetryState] = useState({
    isRetrying: false,
    attempt: 0,
    maxAttempts: maxRetries,
    delay: 0,
    error: null,
    success: false,
  });

  const resetRetry = () => {
    setRetryState({
      isRetrying: false,
      attempt: 0,
      maxAttempts: maxRetries,
      delay: 0,
      error: null,
      success: false,
    });
  };

  const executeWithRetry = async (fn, context = 'Operation') => {
    resetRetry();

    try {
      const result = await retryWithBackoff(fn, maxRetries, initialDelay, context, {
        onRetry: (attempt, max, delay) => {
          setRetryState({
            isRetrying: true,
            attempt,
            maxAttempts: max,
            delay,
            error: null,
            success: false,
          });
        },
        onSuccess: (attempt) => {
          setRetryState({
            isRetrying: false,
            attempt,
            maxAttempts: maxRetries,
            delay: 0,
            error: null,
            success: true,
          });
        },
        onFailure: (error, attempts) => {
          setRetryState({
            isRetrying: false,
            attempt: attempts,
            maxAttempts: maxRetries,
            delay: 0,
            error: handleAPIError(error, context),
            success: false,
          });
        },
      });

      return result;
    } catch (error) {
      throw handleAPIError(error, context);
    }
  };

  return {
    retryState,
    executeWithRetry,
    resetRetry,
    isRetrying: retryState.isRetrying,
    retryMessage: retryState.isRetrying
      ? `Retrying... (${retryState.attempt} of ${retryState.maxAttempts})`
      : null,
  };
}

export default {
  AppError,
  ERROR_CODES,
  getUserMessage,
  getErrorCodeFromStatus,
  handleAPIError,
  handleGeolocationError,
  useErrorHandler,
  retryWithBackoff,
  useRetryHandler,
};
