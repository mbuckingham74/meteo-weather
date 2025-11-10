/**
 * Error Suggestions Utility
 * Provides actionable suggestions for error messages
 * Phase 2 Accessibility Enhancement - WCAG 3.3.3 Error Suggestion (Level AA)
 */

import { ERROR_CODES } from './errorHandler';

/**
 * Get actionable suggestions for common errors
 * @param {string} errorCode - Error code from ERROR_CODES
 * @param {Object} _context - Additional context about the error (reserved for future use)
 * @returns {Array<string>} - Array of suggestion strings
 */
export function getErrorSuggestions(errorCode, _context = {}) {
  const suggestions = {
    // Network errors
    [ERROR_CODES.NETWORK_ERROR]: [
      'Check that you are connected to the internet',
      'Try disabling any VPN or proxy',
      'Refresh the page and try again',
      'Check if your firewall is blocking the connection',
    ],

    [ERROR_CODES.TIMEOUT_ERROR]: [
      'Try again in a few moments',
      'Check your internet connection speed',
      'Close other applications using bandwidth',
      'Try using a wired connection instead of Wi-Fi',
    ],

    [ERROR_CODES.CONNECTION_ERROR]: [
      'Check that the server is online',
      'Try again in a few minutes',
      'Check your internet connection',
      'Clear your browser cache and cookies',
    ],

    // API errors
    [ERROR_CODES.RATE_LIMITED]: [
      'Wait 1-2 minutes before trying again',
      'Reduce the frequency of your requests',
      'Sign in to get higher rate limits',
    ],

    [ERROR_CODES.API_ERROR]: [
      'Refresh the page and try again',
      'Try a different location or time range',
      'Contact support if the problem persists',
    ],

    [ERROR_CODES.INVALID_RESPONSE]: [
      'Refresh the page to get fresh data',
      'Clear your browser cache',
      'Try again in a few moments',
    ],

    // Location errors
    [ERROR_CODES.INVALID_LOCATION]: [
      'Check the spelling of the city name',
      'Try adding the state or country (e.g., "Paris, France")',
      'Use a ZIP code instead',
      'Try a nearby larger city',
    ],

    [ERROR_CODES.LOCATION_NOT_FOUND]: [
      'Try a different spelling (e.g., "New York" vs "New York City")',
      'Add the country name (e.g., "London, UK")',
      'Try coordinates (latitude, longitude)',
      'Use a ZIP/postal code',
    ],

    [ERROR_CODES.GEOLOCATION_DENIED]: [
      'Click the location icon in your address bar',
      'Select "Allow" when prompted for location access',
      'Check browser settings > Privacy > Location',
      'Search for your location manually instead',
    ],

    [ERROR_CODES.GEOLOCATION_UNAVAILABLE]: [
      'Make sure location services are enabled on your device',
      'Try searching for your location manually',
      'Check that your browser has location permissions',
      'Use Wi-Fi instead of cellular data for better accuracy',
    ],

    // Authentication errors
    [ERROR_CODES.AUTH_FAILED]: [
      'Check that your email and password are correct',
      'Make sure Caps Lock is off',
      'Try resetting your password',
      'Clear browser cookies and try again',
    ],

    [ERROR_CODES.TOKEN_EXPIRED]: [
      'Click "Sign In" to log in again',
      'Your session has expired for security',
    ],

    [ERROR_CODES.UNAUTHORIZED]: [
      'Make sure you are logged in',
      'This feature requires an account',
      'Contact support if you should have access',
    ],

    // Data errors
    [ERROR_CODES.VALIDATION_ERROR]: [
      'Check that all required fields are filled',
      'Make sure data is in the correct format',
      'Review error messages for specific fields',
    ],

    [ERROR_CODES.PARSE_ERROR]: [
      'Try refreshing the page',
      'Clear your browser cache',
      'Contact support if this persists',
    ],

    [ERROR_CODES.DATA_NOT_FOUND]: [
      'Try a different date range',
      'Check that the location name is correct',
      'Some historical data may not be available',
      'Try a nearby location',
    ],

    // Generic errors
    [ERROR_CODES.UNKNOWN_ERROR]: [
      'Refresh the page and try again',
      'Clear browser cache and cookies',
      'Try using a different browser',
      'Contact support if the problem continues',
    ],

    [ERROR_CODES.SERVER_ERROR]: [
      'Try again in a few minutes',
      'The server may be under maintenance',
      'Check our status page for updates',
      'Contact support if this persists',
    ],
  };

  return suggestions[errorCode] || suggestions[ERROR_CODES.UNKNOWN_ERROR];
}

/**
 * Format error with suggestions for display
 * @param {string} errorMessage - Main error message
 * @param {string} errorCode - Error code
 * @param {Object} context - Additional context
 * @returns {Object} - Formatted error with message and suggestions
 */
export function formatErrorWithSuggestions(errorMessage, errorCode, context = {}) {
  const suggestions = getErrorSuggestions(errorCode, context);

  return {
    message: errorMessage,
    code: errorCode,
    suggestions,
    hasSuggestions: suggestions && suggestions.length > 0,
  };
}

/**
 * Get contextual help text for specific error scenarios
 * @param {string} errorCode - Error code
 * @param {Object} _context - Additional context (reserved for future use)
 * @returns {string|null} - Helpful context-specific text
 */
export function getContextualHelp(errorCode, _context = {}) {
  const helpText = {
    [ERROR_CODES.GEOLOCATION_DENIED]:
      'Your browser blocks location access by default for privacy. You can change this in browser settings or search manually.',

    [ERROR_CODES.RATE_LIMITED]:
      'We limit requests to protect our servers and ensure fair access for all users.',

    [ERROR_CODES.DATA_NOT_FOUND]:
      'Weather data may not be available for all locations and time periods. Historical data is limited to the past 5 days.',

    [ERROR_CODES.TOKEN_EXPIRED]:
      'For your security, login sessions expire after 24 hours of inactivity.',
  };

  return helpText[errorCode] || null;
}

/**
 * Get browser-specific instructions for common tasks
 * @param {string} task - Task name (e.g., 'enable-location', 'clear-cache')
 * @returns {Object} - Instructions for each browser
 */
export function getBrowserInstructions(task) {
  const instructions = {
    'enable-location': {
      chrome: 'Click the lock icon > Site Settings > Location > Allow',
      firefox: 'Click the lock icon > Permissions > Location > Allow',
      safari: 'Safari > Settings > Websites > Location > Allow for this website',
      edge: 'Click the lock icon > Permissions for this site > Location > Allow',
    },
    'clear-cache': {
      chrome: 'Press Ctrl+Shift+Delete > Select "Cached images and files" > Clear data',
      firefox: 'Press Ctrl+Shift+Delete > Select "Cache" > Clear Now',
      safari: 'Safari > Settings > Privacy > Manage Website Data > Remove All',
      edge: 'Press Ctrl+Shift+Delete > Select "Cached images and files" > Clear now',
    },
  };

  return instructions[task] || null;
}

/**
 * Detect user's browser for specific instructions
 * @returns {string} - Browser name ('chrome', 'firefox', 'safari', 'edge', 'other')
 */
export function detectBrowser() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome';
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
  if (userAgent.includes('edg')) return 'edge';

  return 'other';
}

/**
 * Get priority suggestion (most likely to help)
 * @param {string} errorCode - Error code
 * @returns {string|null} - Top suggestion
 */
export function getPrioritySuggestion(errorCode) {
  const suggestions = getErrorSuggestions(errorCode);
  return suggestions && suggestions.length > 0 ? suggestions[0] : null;
}

export default {
  getErrorSuggestions,
  formatErrorWithSuggestions,
  getContextualHelp,
  getBrowserInstructions,
  detectBrowser,
  getPrioritySuggestion,
};
