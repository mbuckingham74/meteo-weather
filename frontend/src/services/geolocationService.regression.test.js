/**
 * CRITICAL REGRESSION TESTS for "Old Location" Bug
 *
 * These tests ensure we NEVER re-introduce the bug where "Your Location"
 * string is sent to the backend API instead of coordinates.
 *
 * See: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md
 *
 * ⚠️ IF THESE TESTS FAIL, THE BUG HAS RETURNED! ⚠️
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Helper to create proper Response-like objects for fetch mocks
 * Includes headers Map to prevent "Cannot read properties of undefined (reading 'get')" errors
 */
const createMockResponse = (data, options = {}) => {
  const status = options.status || 200;
  const ok = options.ok !== undefined ? options.ok : status < 400;
  let statusText = options.statusText;

  if (!statusText) {
    if (status === 200) statusText = 'OK';
    else if (status === 400) statusText = 'Bad Request';
    else if (status === 401) statusText = 'Unauthorized';
    else if (status === 403) statusText = 'Forbidden';
    else if (status === 404) statusText = 'Not Found';
    else if (status === 500) statusText = 'Internal Server Error';
    else statusText = 'Unknown';
  }

  return {
    ok,
    status,
    statusText,
    headers: new Map([['content-type', 'application/json']]),
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
};

// Mock the reverseGeocode function
vi.mock('./weatherApi', () => ({
  reverseGeocode: vi.fn(),
}));

import { getCurrentLocation } from './geolocationService';
import { reverseGeocode } from './weatherApi';

describe('🚨 REGRESSION PREVENTION: Old Location Bug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CRITICAL: IP Geolocation WITHOUT City Data', () => {
    it('MUST return coordinates (NOT "Your Location") when city is missing', async () => {
      // This is the EXACT scenario that caused the bug
      const mockIPResponse = {
        city: '', // NO CITY DATA
        region: 'Free State',
        country: 'South Africa',
        latitude: -28.2179,
        longitude: 28.3176,
        timezone: 'Africa/Johannesburg',
      };

      global.fetch = vi.fn(() => Promise.resolve(createMockResponse(mockIPResponse)));

      const mockGeolocation = {
        getCurrentPosition: vi.fn((success, error) => {
          error({ code: 1, message: 'User denied geolocation' });
        }),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
        configurable: true,
      });

      const location = await getCurrentLocation();

      // 🚨 CRITICAL ASSERTION 🚨
      // If this fails, the "Old Location" bug has returned!
      expect(location.address).toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);
      expect(location.address).not.toBe('Your Location');
      expect(location.address).not.toBe('Old Location');

      // Should be coordinates
      expect(location.address).toContain('-28.2179');
      expect(location.address).toContain('28.3176');
    });

    it('MUST treat "Unknown" city as missing data', async () => {
      const mockIPResponse = {
        city: 'Unknown', // Placeholder
        region: 'Unknown',
        country: 'ZA',
        latitude: -28.2179,
        longitude: 28.3176,
        timezone: 'Africa/Johannesburg',
      };

      global.fetch = vi.fn(() => Promise.resolve(createMockResponse(mockIPResponse)));

      const mockGeolocation = {
        getCurrentPosition: vi.fn((success, error) => {
          error({ code: 1, message: 'User denied geolocation' });
        }),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
        configurable: true,
      });

      const location = await getCurrentLocation();

      // "Unknown" should be treated as missing, return coordinates
      expect(location.address).toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);
      expect(location.address).not.toContain('Unknown');
      expect(location.address).not.toBe('Your Location');
    });

    it('MUST treat empty/whitespace city as missing data', async () => {
      const mockIPResponse = {
        city: '   ', // Whitespace
        region: 'Unknown',
        country: 'ZA',
        latitude: -28.2179,
        longitude: 28.3176,
        timezone: 'Africa/Johannesburg',
      };

      global.fetch = vi.fn(() => Promise.resolve(createMockResponse(mockIPResponse)));

      const mockGeolocation = {
        getCurrentPosition: vi.fn((success, error) => {
          error({ code: 1, message: 'User denied geolocation' });
        }),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
        configurable: true,
      });

      const location = await getCurrentLocation();

      expect(location.address).toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);
      expect(location.address).not.toBe('Your Location');
    });
  });

  describe('CRITICAL: Browser Geolocation Reverse Geocoding Failures', () => {
    it('MUST return coordinates when reverse geocoding fails completely', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: 47.6062,
              longitude: -122.3321,
              accuracy: 50,
            },
          });
        }),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
        configurable: true,
      });

      // Mock reverse geocoding to FAIL
      reverseGeocode.mockRejectedValue(new Error('Reverse geocoding failed'));

      const location = await getCurrentLocation();

      // 🚨 CRITICAL: Should return coordinates, NOT "Your Location"
      expect(location.address).toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);
      expect(location.address).not.toBe('Your Location');
      expect(location.latitude).toBe(47.6062);
      expect(location.longitude).toBe(-122.3321);
    });

    it('MUST return coordinates when reverse geocoding returns coordinates-only', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: 47.6062,
              longitude: -122.3321,
              accuracy: 50,
            },
          });
        }),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
        configurable: true,
      });

      // Mock reverse geocoding returning coordinates (rate limited scenario)
      reverseGeocode.mockResolvedValue({
        address: '47.6062, -122.3321', // API returned coords
        latitude: 47.6062,
        longitude: -122.3321,
      });

      const location = await getCurrentLocation();

      // Should keep coordinates, not replace with "Your Location"
      expect(location.address).toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);
      expect(location.address).not.toBe('Your Location');
    });
  });
});

/**
 * SOURCE CODE STATIC ANALYSIS
 * Prevents regression by detecting "Your Location" in wrong places
 */
describe('🔍 SOURCE CODE SAFEGUARD: geolocationService.js', () => {
  it('MUST NOT contain "Your Location" in IP geolocation parser logic', () => {
    const filePath = resolve(__dirname, 'geolocationService.js');
    const sourceCode = readFileSync(filePath, 'utf-8');

    // Extract the IP parser sections (getLocationFromIP function)
    const ipFunctionStart = sourceCode.indexOf('async function getLocationFromIP()');
    const ipFunctionEnd = sourceCode.indexOf('export async function getCurrentLocation()');

    if (ipFunctionStart === -1 || ipFunctionEnd === -1) {
      throw new Error('Cannot find IP geolocation function - code structure changed!');
    }

    const ipParserCode = sourceCode.substring(ipFunctionStart, ipFunctionEnd);

    // Check for "Your Location" being assigned to address variable
    // This regex finds: address = 'Your Location' or address = "Your Location"
    const badPattern = /address\s*[=:]\s*['"`]Your Location['"`]/gi;
    const matches = ipParserCode.match(badPattern);

    if (matches && matches.length > 0) {
      throw new Error(
        '🚨🚨🚨 CRITICAL REGRESSION DETECTED! 🚨🚨🚨\n\n' +
          '"Your Location" string found in IP geolocation parser!\n' +
          'This will send "Your Location" to the backend API, causing the "Old Location" bug.\n\n' +
          'Found violations:\n' +
          matches.join('\n') +
          '\n\n' +
          'FIX: Replace with coordinates:\n' +
          '  WRONG: address = "Your Location"\n' +
          '  RIGHT: address = `${latitude}, ${longitude}`\n\n' +
          'See: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md'
      );
    }

    // ✅ If we get here, no "Your Location" assignments found
    expect(matches).toBeNull();
  });

  it('IP parsers MUST return coordinates when city is invalid', () => {
    const filePath = resolve(__dirname, 'geolocationService.js');
    const sourceCode = readFileSync(filePath, 'utf-8');

    // Check that the parser sections contain coordinates fallback
    const ipFunctionStart = sourceCode.indexOf('async function getLocationFromIP()');
    const ipFunctionEnd = sourceCode.indexOf('export async function getCurrentLocation()');
    const ipParserCode = sourceCode.substring(ipFunctionStart, ipFunctionEnd);

    // Should contain coordinate formatting logic
    const hasCoordinateFallback =
      /\$\{.*latitude.*\}.*\$\{.*longitude.*\}/.test(ipParserCode) ||
      /\$\{.*longitude.*\}.*\$\{.*latitude.*\}/.test(ipParserCode);

    if (!hasCoordinateFallback) {
      throw new Error(
        '🚨 MISSING COORDINATE FALLBACK in IP parser!\n' +
          'IP geolocation parsers MUST return coordinates when city is unavailable.\n' +
          'Expected pattern: `${latitude}, ${longitude}`'
      );
    }

    expect(hasCoordinateFallback).toBe(true);
  });
});

/**
 * INTEGRATION TEST: End-to-end location detection flow
 */
describe('🔄 INTEGRATION: Complete Location Detection Flow', () => {
  it('handles complete failure gracefully without "Your Location" reaching backend', async () => {
    // Simulate worst-case scenario:
    // 1. Browser geolocation denied
    // 2. IP service returns no city
    // 3. Reverse geocoding fails

    const mockGeolocation = {
      getCurrentPosition: vi.fn((success, error) => {
        error({ code: 1, message: 'Permission denied' });
      }),
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });

    // IP service returns no city
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            city: '',
            latitude: -28.2179,
            longitude: 28.3176,
            timezone: 'Africa/Johannesburg',
          }),
      })
    );

    const location = await getCurrentLocation();

    // Even in worst case, should return coordinates
    expect(location.address).toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);
    expect(location.address).not.toBe('Your Location');

    // These coordinates would be sent to the backend API
    // They are valid and will work with Visual Crossing/OpenWeather
    expect(location.latitude).toBe(-28.2179);
    expect(location.longitude).toBe(28.3176);
  });
});
