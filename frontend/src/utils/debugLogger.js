/* eslint-disable no-console */
/**
 * Debug Logger Utility
 * Centralized logging for development with environment-aware behavior
 *
 * Usage:
 * import { debugLog } from '../utils/debugLogger';
 * debugLog('ComponentName', { data: someData, action: 'mounted' });
 *
 * Note: Console statements are intentional in this file for debug logging.
 */

/**
 * Check if debug mode is enabled
 * Debug mode is enabled when VITE_DEBUG is set to 'true'
 */
const isDebugMode = () => {
  return import.meta.env.VITE_DEBUG === 'true' || import.meta.env.MODE === 'development';
};

/**
 * Log levels for different types of messages
 */
export const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
};

/**
 * Emoji icons for different log levels
 */
const LOG_ICONS = {
  [LogLevel.INFO]: 'ℹ️',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '❌',
  [LogLevel.SUCCESS]: '✅',
};

/**
 * Debug log function
 * Only logs in development or when VITE_DEBUG=true
 *
 * @param {string} namespace - Component or module name
 * @param {any} data - Data to log
 * @param {string} level - Log level (INFO, WARN, ERROR, SUCCESS)
 *
 * @example
 * debugLog('WeatherDashboard', { location: 'Seattle' }, LogLevel.INFO);
 * debugLog('API', { error: 'Failed to fetch' }, LogLevel.ERROR);
 */
export function debugLog(namespace, data, level = LogLevel.INFO) {
  if (!isDebugMode()) {
    return;
  }

  const icon = LOG_ICONS[level] || 'ℹ️';
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `${icon} [${namespace}] [${timestamp}]`;

  // Use appropriate console method based on level
  switch (level) {
    case LogLevel.ERROR:
      console.error(prefix, data);
      break;
    case LogLevel.WARN:
      console.warn(prefix, data);
      break;
    case LogLevel.SUCCESS:
    case LogLevel.INFO:
    default:
      console.log(prefix, data);
      break;
  }
}

/**
 * Convenience functions for different log levels
 */
export const debugInfo = (namespace, data) => debugLog(namespace, data, LogLevel.INFO);
export const debugWarn = (namespace, data) => debugLog(namespace, data, LogLevel.WARN);
export const debugError = (namespace, data) => debugLog(namespace, data, LogLevel.ERROR);
export const debugSuccess = (namespace, data) => debugLog(namespace, data, LogLevel.SUCCESS);

/**
 * Debug logger for component lifecycle
 * Useful for tracking component mount/unmount
 */
export function debugLifecycle(componentName, event, data = {}) {
  const eventIcons = {
    mount: '🚀',
    unmount: '💀',
    update: '🔄',
    render: '🎨',
  };

  if (!isDebugMode()) {
    return;
  }

  const icon = eventIcons[event] || '📍';
  console.log(`${icon} [${componentName}] ${event}`, data);
}

/**
 * Debug logger for API calls
 * Tracks API requests and responses
 */
export function debugAPI(endpoint, method = 'GET', data = {}) {
  if (!isDebugMode()) {
    return;
  }

  console.log(`🌐 [API] ${method} ${endpoint}`, data);
}

/**
 * Debug logger for state changes
 * Tracks state updates in components
 */
export function debugState(componentName, stateName, oldValue, newValue) {
  if (!isDebugMode()) {
    return;
  }

  console.log(`📊 [${componentName}] State: ${stateName}`, {
    old: oldValue,
    new: newValue,
  });
}

/**
 * Group related debug logs together
 * Useful for complex operations with multiple steps
 */
export function debugGroup(groupName, callback) {
  if (!isDebugMode()) {
    // Still execute callback even if not logging
    callback();
    return;
  }

  console.group(`📦 ${groupName}`);
  try {
    callback();
  } finally {
    console.groupEnd();
  }
}

/**
 * Performance timing utility
 * Measures execution time of operations
 */
export function debugTime(label, callback) {
  if (!isDebugMode()) {
    // Still execute callback even if not logging
    return callback();
  }

  console.time(`⏱️ ${label}`);
  try {
    return callback();
  } finally {
    console.timeEnd(`⏱️ ${label}`);
  }
}

/**
 * Async performance timing utility
 * Measures execution time of async operations
 */
export async function debugTimeAsync(label, callback) {
  if (!isDebugMode()) {
    // Still execute callback even if not logging
    return await callback();
  }

  console.time(`⏱️ ${label}`);
  try {
    return await callback();
  } finally {
    console.timeEnd(`⏱️ ${label}`);
  }
}

export default debugLog;
