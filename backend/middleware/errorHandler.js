/**
 * Error Handling Middleware
 *
 * Centralized error handling for Express routes
 * Converts all errors to standardized API responses
 *
 * Usage in server.js:
 * ```js
 * const { errorHandler, asyncHandler } = require('./middleware/errorHandler');
 *
 * // Use asyncHandler to wrap async routes
 * app.get('/api/weather', asyncHandler(async (req, res) => {
 *   const data = await weatherService.getData();
 *   res.json(data);
 * }));
 *
 * // Add error handler as last middleware
 * app.use(errorHandler);
 * ```
 */

const { isApiError, toApiError, ERROR_CODES } = require('../utils/errorCodes');
const logger = require('../utils/logger');

/**
 * Async handler wrapper
 * Catches errors from async route handlers and passes to error middleware
 *
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handling middleware
 * Converts all errors to standardized JSON responses
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, _next) {
  // Convert to ApiError if not already
  const apiError = isApiError(err)
    ? err
    : toApiError(err, `${req.method} ${req.originalUrl || req.url}`);

  // Log error based on severity
  if (apiError.status >= 500) {
    logger.error('API Error', `${apiError.code}: ${apiError.message}`, {
      method: req.method,
      url: req.originalUrl || req.url,
      status: apiError.status,
      context: apiError.context,
      stack: err.stack,
    });
  } else if (apiError.status >= 400) {
    logger.warn('API Error', `${apiError.code}: ${apiError.message}`, {
      method: req.method,
      url: req.originalUrl || req.url,
      status: apiError.status,
    });
  }

  // Send error response
  res.status(apiError.status).json(apiError.toJSON());
}

/**
 * 404 Not Found handler
 * Creates a standardized 404 response for unknown routes
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function notFoundHandler(req, res) {
  const { createError } = require('../utils/errorCodes');

  res
    .status(404)
    .json(
      createError(
        ERROR_CODES.NOT_FOUND,
        `Route ${req.method} ${req.originalUrl || req.url} not found`
      ).toJSON()
    );
}

/**
 * Request logging middleware
 * Logs all incoming requests with timing
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req, res.statusCode, duration);
  });

  next();
}

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler,
  requestLogger,
};
