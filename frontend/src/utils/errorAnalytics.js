/**
 * Error Analytics Utility
 *
 * Provides hooks and utilities for error tracking and analytics.
 * Part of Error Message Improvement Initiative (Phase 4).
 *
 * This module provides a foundation for integrating error tracking services
 * like Sentry, LogRocket, or custom analytics platforms.
 *
 * Features:
 * - Error event tracking
 * - Error frequency monitoring
 * - User context tracking
 * - Custom error metadata
 * - Ready for Sentry/LogRocket integration
 *
 * @module errorAnalytics
 */

import { useState, useEffect, useCallback } from 'react';
import { debugInfo } from './debugLogger';
import { ERROR_CODES } from './errorHandler';

/**
 * Error Analytics Configuration
 * Override these values by setting environment variables
 */
const ANALYTICS_CONFIG = {
  enabled: import.meta.env.VITE_ERROR_ANALYTICS_ENABLED === 'true',
  environment: import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'development',
  sampleRate: parseFloat(import.meta.env.VITE_ERROR_SAMPLE_RATE || '1.0'), // 1.0 = 100%
  maxStoredErrors: parseInt(import.meta.env.VITE_MAX_STORED_ERRORS || '50', 10),
  // Future: Add Sentry DSN, LogRocket app ID, etc.
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || null,
  logRocketAppId: import.meta.env.VITE_LOGROCKET_APP_ID || null,
};

/**
 * In-memory error store for local tracking
 * In production, this would be sent to an analytics service
 */
class ErrorStore {
  constructor(maxSize = 50) {
    this.errors = [];
    this.maxSize = maxSize;
    this.errorCounts = new Map(); // Track error frequency by code
  }

  /**
   * Add error to store
   * @param {Object} errorData - Error data to store
   */
  add(errorData) {
    // Add to list
    this.errors.unshift(errorData);

    // Trim to max size
    if (this.errors.length > this.maxSize) {
      this.errors = this.errors.slice(0, this.maxSize);
    }

    // Update error frequency count
    const code = errorData.code || 'UNKNOWN';
    this.errorCounts.set(code, (this.errorCounts.get(code) || 0) + 1);

    // In production, you would send this to your analytics service
    this._sendToAnalytics(errorData);
  }

  /**
   * Get all stored errors
   * @returns {Array} Array of error data
   */
  getAll() {
    return [...this.errors];
  }

  /**
   * Get error frequency statistics
   * @returns {Object} Error code frequencies
   */
  getFrequencies() {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * Get errors by code
   * @param {string} code - Error code to filter by
   * @returns {Array} Filtered errors
   */
  getByCode(code) {
    return this.errors.filter((err) => err.code === code);
  }

  /**
   * Clear all stored errors
   */
  clear() {
    this.errors = [];
    this.errorCounts.clear();
  }

  /**
   * Send error data to analytics service
   * @private
   * @param {Object} errorData - Error data
   */
  _sendToAnalytics(errorData) {
    if (!ANALYTICS_CONFIG.enabled) {
      return;
    }

    // Sample rate check
    if (Math.random() > ANALYTICS_CONFIG.sampleRate) {
      return;
    }

    // In development, just log
    if (ANALYTICS_CONFIG.environment === 'development') {
      debugInfo('Error Analytics', 'Error tracked', errorData);
      return;
    }

    // TODO: In production, send to analytics service
    // Example Sentry integration:
    // if (ANALYTICS_CONFIG.sentryDsn && window.Sentry) {
    //   window.Sentry.captureException(new Error(errorData.message), {
    //     level: 'error',
    //     tags: {
    //       errorCode: errorData.code,
    //       component: errorData.component,
    //     },
    //     extra: errorData.context,
    //   });
    // }

    // Example LogRocket integration:
    // if (ANALYTICS_CONFIG.logRocketAppId && window.LogRocket) {
    //   window.LogRocket.captureException(new Error(errorData.message), {
    //     tags: {
    //       errorCode: errorData.code,
    //     },
    //     extra: errorData.context,
    //   });
    // }

    // Example custom analytics endpoint:
    // fetch('/api/analytics/error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // }).catch(() => {
    //   // Silently fail - don't let analytics break the app
    // });
  }
}

// Global error store instance
const errorStore = new ErrorStore(ANALYTICS_CONFIG.maxStoredErrors);

/**
 * Track an error event
 *
 * @param {Object} error - Error object or AppError
 * @param {Object} options - Additional tracking options
 * @param {string} options.component - Component where error occurred
 * @param {string} options.action - User action that triggered error
 * @param {Object} options.context - Additional context
 * @param {string} options.userId - User ID (if authenticated)
 * @param {string} options.sessionId - Session ID
 *
 * @example
 * trackError(error, {
 *   component: 'WeatherDashboard',
 *   action: 'fetchWeatherData',
 *   context: { location: 'Seattle' }
 * });
 */
export function trackError(error, options = {}) {
  const errorData = {
    message: error.message || 'Unknown error',
    code: error.code || ERROR_CODES.UNKNOWN_ERROR,
    timestamp: new Date().toISOString(),
    component: options.component || 'Unknown',
    action: options.action || 'Unknown',
    context: {
      ...error.context,
      ...options.context,
    },
    userId: options.userId || null,
    sessionId: options.sessionId || getSessionId(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    recoverable: error.recoverable !== false,
    environment: ANALYTICS_CONFIG.environment,
  };

  errorStore.add(errorData);

  return errorData;
}

/**
 * React hook for error analytics
 *
 * Provides error tracking with automatic context capture.
 *
 * @param {string} component - Component name for error context
 * @returns {Object} Analytics functions
 *
 * @example
 * const { trackError, errorStats } = useErrorAnalytics('WeatherDashboard');
 *
 * try {
 *   await fetchData();
 * } catch (error) {
 *   trackError(error, { action: 'fetchWeatherData' });
 * }
 */
export function useErrorAnalytics(component = 'Unknown') {
  const [errorStats, setErrorStats] = useState({
    totalErrors: 0,
    errorsByCode: {},
    recentErrors: [],
  });

  // Update stats when errors change
  useEffect(() => {
    const updateStats = () => {
      setErrorStats({
        totalErrors: errorStore.errors.length,
        errorsByCode: errorStore.getFrequencies(),
        recentErrors: errorStore.errors.slice(0, 10),
      });
    };

    // Initial update
    updateStats();

    // Update every 5 seconds if in development
    let interval;
    if (ANALYTICS_CONFIG.environment === 'development') {
      interval = setInterval(updateStats, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  /**
   * Track error with component context
   */
  const track = useCallback(
    (error, options = {}) => {
      return trackError(error, {
        ...options,
        component,
      });
    },
    [component]
  );

  /**
   * Get error statistics
   */
  const getStats = useCallback(() => {
    return {
      totalErrors: errorStore.errors.length,
      errorsByCode: errorStore.getFrequencies(),
      recentErrors: errorStore.errors.slice(0, 10),
      allErrors: errorStore.getAll(),
    };
  }, []);

  /**
   * Clear error history
   */
  const clearErrors = useCallback(() => {
    errorStore.clear();
    setErrorStats({
      totalErrors: 0,
      errorsByCode: {},
      recentErrors: [],
    });
  }, []);

  return {
    trackError: track,
    errorStats,
    getStats,
    clearErrors,
  };
}

/**
 * Get or create session ID
 * @returns {string} Session ID
 */
function getSessionId() {
  const SESSION_KEY = 'meteo_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Get error analytics statistics
 * @returns {Object} Error statistics
 */
export function getErrorStats() {
  return {
    totalErrors: errorStore.errors.length,
    errorsByCode: errorStore.getFrequencies(),
    recentErrors: errorStore.errors.slice(0, 10),
    allErrors: errorStore.getAll(),
  };
}

/**
 * Get most frequent errors
 * @param {number} limit - Number of errors to return
 * @returns {Array} Most frequent error codes
 */
export function getMostFrequentErrors(limit = 5) {
  const frequencies = errorStore.getFrequencies();
  return Object.entries(frequencies)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([code, count]) => ({ code, count }));
}

/**
 * Clear all tracked errors
 */
export function clearErrorHistory() {
  errorStore.clear();
}

/**
 * Initialize error analytics (call this in your app's entry point)
 * @param {Object} config - Configuration options
 */
export function initErrorAnalytics(config = {}) {
  Object.assign(ANALYTICS_CONFIG, config);

  debugInfo('Error Analytics', 'Initialized', {
    enabled: ANALYTICS_CONFIG.enabled,
    environment: ANALYTICS_CONFIG.environment,
    sampleRate: ANALYTICS_CONFIG.sampleRate,
  });

  // Set up global error handler
  if (ANALYTICS_CONFIG.enabled) {
    window.addEventListener('error', (event) => {
      trackError(
        {
          message: event.message,
          code: ERROR_CODES.UNKNOWN_ERROR,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
        {
          component: 'Global',
          action: 'uncaughtError',
        }
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      trackError(
        {
          message: event.reason?.message || 'Unhandled promise rejection',
          code: ERROR_CODES.UNKNOWN_ERROR,
          context: {
            reason: event.reason,
          },
        },
        {
          component: 'Global',
          action: 'unhandledRejection',
        }
      );
    });
  }
}

/**
 * Export configuration for inspection
 */
export function getAnalyticsConfig() {
  return { ...ANALYTICS_CONFIG };
}

export default {
  trackError,
  useErrorAnalytics,
  getErrorStats,
  getMostFrequentErrors,
  clearErrorHistory,
  initErrorAnalytics,
  getAnalyticsConfig,
};
