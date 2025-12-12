/**
 * Backend Error Codes Catalog
 *
 * Standardized error codes for API responses
 * Maps to frontend ERROR_CODES where applicable
 *
 * Usage:
 * ```js
 * const { ERROR_CODES, createError } = require('../utils/errorCodes');
 * throw createError(ERROR_CODES.VALIDATION_ERROR, 'Invalid email format');
 * ```
 */

/**
 * Error code constants
 * These map to HTTP status codes and frontend ERROR_CODES
 */
const ERROR_CODES = {
  // Client Errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',           // 400 - Invalid input data
  UNAUTHORIZED: 'UNAUTHORIZED',                   // 401 - Not authenticated
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',                 // 401 - JWT expired
  FORBIDDEN: 'FORBIDDEN',                         // 403 - Authenticated but no permission
  NOT_FOUND: 'NOT_FOUND',                         // 404 - Resource not found
  CONFLICT: 'CONFLICT',                           // 409 - Duplicate resource
  RATE_LIMITED: 'RATE_LIMITED',                   // 429 - Too many requests

  // Server Errors (5xx)
  SERVER_ERROR: 'SERVER_ERROR',                   // 500 - Generic server error
  DATABASE_ERROR: 'DATABASE_ERROR',               // 500 - Database operation failed
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',       // 502 - External API failed
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',     // 503 - Service temporarily down
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',                 // 504 - Request timeout

  // Business Logic Errors
  LOCATION_NOT_FOUND: 'LOCATION_NOT_FOUND',       // 404 - Location geocoding failed
  WEATHER_DATA_UNAVAILABLE: 'WEATHER_DATA_UNAVAILABLE', // 503 - Weather API unavailable
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',     // 401 - Wrong email/password
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',   // 409 - Email taken
  WEAK_PASSWORD: 'WEAK_PASSWORD',                 // 400 - Password too weak
  INVALID_TOKEN: 'INVALID_TOKEN',                 // 401 - Malformed JWT
  CACHE_ERROR: 'CACHE_ERROR',                     // 500 - Cache operation failed

  // AI Service Errors
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',           // 500 - AI service failed
  AI_RATE_LIMITED: 'AI_RATE_LIMITED',             // 429 - AI API rate limit
  AI_TIMEOUT: 'AI_TIMEOUT',                       // 504 - AI request timeout
};

/**
 * Map error codes to HTTP status codes
 */
const ERROR_CODE_TO_STATUS = {
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.TOKEN_EXPIRED]: 401,
  [ERROR_CODES.INVALID_CREDENTIALS]: 401,
  [ERROR_CODES.INVALID_TOKEN]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.LOCATION_NOT_FOUND]: 404,
  [ERROR_CODES.CONFLICT]: 409,
  [ERROR_CODES.EMAIL_ALREADY_EXISTS]: 409,
  [ERROR_CODES.WEAK_PASSWORD]: 400,
  [ERROR_CODES.RATE_LIMITED]: 429,
  [ERROR_CODES.AI_RATE_LIMITED]: 429,
  [ERROR_CODES.SERVER_ERROR]: 500,
  [ERROR_CODES.DATABASE_ERROR]: 500,
  [ERROR_CODES.CACHE_ERROR]: 500,
  [ERROR_CODES.AI_SERVICE_ERROR]: 500,
  [ERROR_CODES.EXTERNAL_API_ERROR]: 502,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.WEATHER_DATA_UNAVAILABLE]: 503,
  [ERROR_CODES.TIMEOUT_ERROR]: 504,
  [ERROR_CODES.AI_TIMEOUT]: 504,
};

/**
 * User-friendly error messages for each error code
 * These are sent to the client
 */
const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Invalid input data. Please check your request.',
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication required. Please log in.',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ERROR_CODES.FORBIDDEN]: 'You don\'t have permission to access this resource.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.CONFLICT]: 'This resource already exists.',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please try again later.',
  [ERROR_CODES.SERVER_ERROR]: 'An unexpected error occurred. Please try again.',
  [ERROR_CODES.DATABASE_ERROR]: 'Database operation failed. Please try again.',
  [ERROR_CODES.EXTERNAL_API_ERROR]: 'External service unavailable. Please try again later.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ERROR_CODES.LOCATION_NOT_FOUND]: 'Location not found. Please check the location name.',
  [ERROR_CODES.WEATHER_DATA_UNAVAILABLE]: 'Weather data is currently unavailable.',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ERROR_CODES.EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
  [ERROR_CODES.WEAK_PASSWORD]: 'Password must be at least 8 characters long.',
  [ERROR_CODES.INVALID_TOKEN]: 'Invalid authentication token.',
  [ERROR_CODES.CACHE_ERROR]: 'Cache operation failed.',
  [ERROR_CODES.AI_SERVICE_ERROR]: 'AI service is currently unavailable.',
  [ERROR_CODES.AI_RATE_LIMITED]: 'AI service rate limit exceeded. Please try again later.',
  [ERROR_CODES.AI_TIMEOUT]: 'AI request timed out. Please try again.',
};

/**
 * Custom error class for API errors
 * Includes error code, status, and optional context
 */
class ApiError extends Error {
  /**
   * @param {string} code - Error code from ERROR_CODES
   * @param {string} message - User-friendly error message (optional)
   * @param {Object} context - Additional context for debugging (optional)
   */
  constructor(code, message = null, context = {}) {
    // Use provided message or default message for the code
    const errorMessage = message || ERROR_MESSAGES[code] || 'An error occurred';
    super(errorMessage);

    this.name = 'ApiError';
    this.code = code;
    this.status = ERROR_CODE_TO_STATUS[code] || 500;
    this.context = context;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert to JSON for API response
   * @returns {Object} Error response object
   */
  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      ...(process.env.NODE_ENV === 'development' && {
        context: this.context,
        stack: this.stack,
      }),
    };
  }
}

/**
 * Create an ApiError with the given code and message
 * @param {string} code - Error code from ERROR_CODES
 * @param {string} message - User-friendly error message (optional)
 * @param {Object} context - Additional context for debugging (optional)
 * @returns {ApiError} API error instance
 */
function createError(code, message = null, context = {}) {
  return new ApiError(code, message, context);
}

/**
 * Check if an error is an ApiError
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is ApiError
 */
function isApiError(error) {
  return error instanceof ApiError;
}

/**
 * Convert any error to ApiError
 * Maps common error types to appropriate error codes
 * @param {Error} error - Error to convert
 * @param {string} context - Context string for debugging
 * @returns {ApiError} API error instance
 */
function toApiError(error, context = '') {
  // Already an ApiError
  if (isApiError(error)) {
    return error;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return createError(ERROR_CODES.INVALID_TOKEN, 'Invalid authentication token', { context });
  }
  if (error.name === 'TokenExpiredError') {
    return createError(ERROR_CODES.TOKEN_EXPIRED, 'Your session has expired', { context });
  }

  // Database errors
  if (error.code === 'ER_DUP_ENTRY') {
    return createError(ERROR_CODES.CONFLICT, 'This resource already exists', { context });
  }
  if (error.code && error.code.startsWith('ER_')) {
    return createError(ERROR_CODES.DATABASE_ERROR, 'Database operation failed', {
      context,
      dbCode: error.code,
    });
  }

  // Axios errors (external API calls)
  if (error.isAxiosError) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return createError(ERROR_CODES.TIMEOUT_ERROR, 'Request timed out', { context });
    }
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return createError(ERROR_CODES.LOCATION_NOT_FOUND, 'Location not found', { context });
      }
      if (status === 429) {
        return createError(ERROR_CODES.RATE_LIMITED, 'Rate limit exceeded', { context });
      }
      if (status >= 500) {
        return createError(ERROR_CODES.EXTERNAL_API_ERROR, 'External service unavailable', {
          context,
          status,
        });
      }
    }
    return createError(ERROR_CODES.EXTERNAL_API_ERROR, 'External service error', { context });
  }

  // Generic server error - never expose raw error.message in production
  // (could leak SQL errors, internal paths, etc.)
  const safeMessage =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message || 'An unexpected error occurred';

  return createError(ERROR_CODES.SERVER_ERROR, safeMessage, {
    context,
    originalError: error.name,
    // Include raw message in context for logging (not sent to client in prod)
    rawMessage: error.message,
  });
}

module.exports = {
  ERROR_CODES,
  ERROR_CODE_TO_STATUS,
  ERROR_MESSAGES,
  ApiError,
  createError,
  isApiError,
  toApiError,
};
