/**
 * Structured Logging Utility
 *
 * Environment-aware logging for backend services
 * - Development: Full console output with colors
 * - Production: Structured JSON logs
 * - Test: Silent (can be overridden)
 *
 * Usage:
 * ```js
 * const logger = require('../utils/logger');
 * logger.info('Weather API', 'Fetched weather data', { location: 'Seattle' });
 * logger.error('Database', 'Connection failed', error);
 * ```
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

const LOG_LEVEL_NAMES = {
  [LOG_LEVELS.DEBUG]: 'DEBUG',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.WARN]: 'WARN',
  [LOG_LEVELS.ERROR]: 'ERROR',
  [LOG_LEVELS.FATAL]: 'FATAL',
};

// ANSI color codes for console output
const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',

  // Foreground colors
  BLACK: '\x1b[30m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',

  // Background colors
  BG_RED: '\x1b[41m',
  BG_YELLOW: '\x1b[43m',
};

const LEVEL_COLORS = {
  [LOG_LEVELS.DEBUG]: COLORS.CYAN,
  [LOG_LEVELS.INFO]: COLORS.BLUE,
  [LOG_LEVELS.WARN]: COLORS.YELLOW,
  [LOG_LEVELS.ERROR]: COLORS.RED,
  [LOG_LEVELS.FATAL]: `${COLORS.BG_RED}${COLORS.WHITE}${COLORS.BRIGHT}`,
};

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEVELOPMENT = NODE_ENV === 'development';
const IS_TEST = NODE_ENV === 'test';
const IS_PRODUCTION = NODE_ENV === 'production';

// Minimum log level (configurable via env var)
const MIN_LOG_LEVEL = process.env.LOG_LEVEL
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO
  : IS_DEVELOPMENT
    ? LOG_LEVELS.DEBUG
    : LOG_LEVELS.INFO;

/**
 * Format timestamp for logs
 * @returns {string} ISO timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Core logging function
 * @param {number} level - Log level
 * @param {string} category - Log category (e.g., "Auth API", "Database")
 * @param {string} message - Log message
 * @param {Object|Error} data - Additional data or error object
 */
function log(level, category, message, data = null) {
  // Skip if below minimum level
  if (level < MIN_LOG_LEVEL) {
    return;
  }

  // Silent in test environment unless explicitly enabled
  if (IS_TEST && !process.env.ENABLE_TEST_LOGS) {
    return;
  }

  const timestamp = getTimestamp();
  const levelName = LOG_LEVEL_NAMES[level];

  // Production: Structured JSON logs
  if (IS_PRODUCTION) {
    const logObject = {
      timestamp,
      level: levelName,
      category,
      message,
      ...(data && { data: serializeData(data) }),
    };
    console.log(JSON.stringify(logObject));
    return;
  }

  // Development: Colorful console output
  const color = LEVEL_COLORS[level];
  const levelTag = `${color}[${levelName}]${COLORS.RESET}`;
  const categoryTag = `${COLORS.BRIGHT}${category}${COLORS.RESET}`;
  const timeTag = `${COLORS.DIM}${timestamp.slice(11, 19)}${COLORS.RESET}`;

  // Format: [12:34:56] [INFO] Auth API - User logged in { userId: 123 }
  const prefix = `${timeTag} ${levelTag} ${categoryTag} -`;

  if (data) {
    if (data instanceof Error) {
      console.log(`${prefix} ${message}`);
      console.log(`${COLORS.DIM}${data.stack}${COLORS.RESET}`);
    } else {
      console.log(`${prefix} ${message}`, data);
    }
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Serialize data for JSON logging
 * Handles errors, circular references, etc.
 * @param {any} data - Data to serialize
 * @returns {any} Serialized data
 */
function serializeData(data) {
  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message,
      stack: data.stack,
      ...(data.code && { code: data.code }),
      ...(data.status && { status: data.status }),
    };
  }

  if (typeof data === 'object' && data !== null) {
    try {
      // Handle circular references
      const seen = new WeakSet();
      return JSON.parse(
        JSON.stringify(data, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        })
      );
    } catch (error) {
      return String(data);
    }
  }

  return data;
}

/**
 * Debug log - Detailed information for debugging
 * @param {string} category - Log category
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function debug(category, message, data = null) {
  log(LOG_LEVELS.DEBUG, category, message, data);
}

/**
 * Info log - General informational messages
 * @param {string} category - Log category
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function info(category, message, data = null) {
  log(LOG_LEVELS.INFO, category, message, data);
}

/**
 * Warning log - Warning messages for potential issues
 * @param {string} category - Log category
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function warn(category, message, data = null) {
  log(LOG_LEVELS.WARN, category, message, data);
}

/**
 * Error log - Error messages
 * @param {string} category - Log category
 * @param {string} message - Log message
 * @param {Error|Object} error - Error object or additional data
 */
function error(category, message, error = null) {
  log(LOG_LEVELS.ERROR, category, message, error);
}

/**
 * Fatal log - Critical errors that require immediate attention
 * @param {string} category - Log category
 * @param {string} message - Log message
 * @param {Error|Object} error - Error object or additional data
 */
function fatal(category, message, error = null) {
  log(LOG_LEVELS.FATAL, category, message, error);
}

/**
 * Log HTTP request
 * @param {Object} req - Express request object
 * @param {number} status - Response status code
 * @param {number} duration - Request duration in ms
 */
function logRequest(req, status, duration) {
  const method = req.method;
  const url = req.originalUrl || req.url;
  const userAgent = req.get('user-agent');

  const message = `${method} ${url} - ${status} (${duration}ms)`;

  if (status >= 500) {
    error('HTTP', message, { method, url, status, duration, userAgent });
  } else if (status >= 400) {
    warn('HTTP', message, { method, url, status, duration });
  } else {
    info('HTTP', message, { method, url, status, duration });
  }
}

/**
 * Create a logger for a specific category
 * @param {string} category - Category name
 * @returns {Object} Logger instance with category bound
 */
function createLogger(category) {
  return {
    debug: (message, data) => debug(category, message, data),
    info: (message, data) => info(category, message, data),
    warn: (message, data) => warn(category, message, data),
    error: (message, error) => error(category, message, error),
    fatal: (message, error) => fatal(category, message, error),
  };
}

module.exports = {
  LOG_LEVELS,
  debug,
  info,
  warn,
  error,
  fatal,
  logRequest,
  createLogger,
};
