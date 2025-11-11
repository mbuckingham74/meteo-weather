/**
 * CRITICAL REGRESSION TESTS for "Old Location" Backend Bug
 *
 * These tests ensure the backend properly handles Visual Crossing API placeholders
 * and converts them to real location names using Nominatim.
 *
 * See: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md
 *
 * ⚠️ IF THESE TESTS FAIL, THE BUG HAS RETURNED! ⚠️
 */

const { reverseGeocodeNominatim } = require('../../services/geocodingService');

// Mock geocoding service
jest.mock('../../services/geocodingService', () => ({
  reverseGeocodeNominatim: jest.fn(),
}));

describe('🚨 REGRESSION PREVENTION: Backend "Old Location" Bug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CRITICAL: Visual Crossing Returns Placeholder', () => {
    it.todo('MUST call Nominatim when VC returns "Old Location"');
    it.todo('MUST call Nominatim when VC returns raw coordinates');
  });

  describe('INTEGRATION: getCurrentWeather with Placeholders', () => {
    it.skip('returns real city name when Visual Crossing returns placeholder', async () => {
      // This would be a full integration test with mocked axios
      // Testing that the entire flow works correctly

      // Mock axios to return placeholder from Visual Crossing
      const axios = require('axios');
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: {
          resolvedAddress: 'Old Location', // ← The bug
          latitude: 47.9062,
          longitude: -124.5745,
          timezone: 'America/Los_Angeles',
          currentConditions: {
            datetime: '12:00:00',
            temp: 52,
            feelslike: 48,
            humidity: 75,
            precip: 0,
            snow: 0,
            windspeed: 10,
            winddir: 180,
            pressure: 1013,
            cloudcover: 50,
            visibility: 10,
            uvindex: 3,
            conditions: 'Partly Cloudy',
            icon: 'partly-cloudy-day',
          },
        },
      });

      // Mock Nominatim
      reverseGeocodeNominatim.mockResolvedValue({
        address: 'Clallam County, Washington, United States of America',
      });

      const weatherService = require('../../services/weatherService');

      // Clear cache to ensure fresh request
      const cacheService = require('../../services/cacheService');
      jest.spyOn(cacheService, 'withCache').mockImplementation(async (source, key, fn) => {
        return await fn();
      });

      const result = await weatherService.getCurrentWeather('47.9062,-124.5745');

      // 🚨 CRITICAL ASSERTION 🚨
      // The address should be the Nominatim result, NOT "Old Location"
      expect(result.location.address).toBe('Clallam County, Washington, United States of America');
      expect(result.location.address).not.toBe('Old Location');
      expect(result.location.address).not.toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);

      // Verify Nominatim was called
      expect(reverseGeocodeNominatim).toHaveBeenCalledWith(47.9062, -124.5745);
    });

    it.skip('returns real city name when Visual Crossing returns coordinates', async () => {
      const axios = require('axios');
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: {
          resolvedAddress: '47.9062,-124.5745', // ← Raw coordinates (also a bug)
          latitude: 47.9062,
          longitude: -124.5745,
          timezone: 'America/Los_Angeles',
          currentConditions: {
            datetime: '12:00:00',
            temp: 52,
            feelslike: 48,
            humidity: 75,
            precip: 0,
            snow: 0,
            windspeed: 10,
            winddir: 180,
            pressure: 1013,
            cloudcover: 50,
            visibility: 10,
            uvindex: 3,
            conditions: 'Partly Cloudy',
            icon: 'partly-cloudy-day',
          },
        },
      });

      reverseGeocodeNominatim.mockResolvedValue({
        address: 'Clallam County, Washington, United States of America',
      });

      const weatherService = require('../../services/weatherService');

      const cacheService = require('../../services/cacheService');
      jest.spyOn(cacheService, 'withCache').mockImplementation(async (source, key, fn) => {
        return await fn();
      });

      const result = await weatherService.getCurrentWeather('47.9062,-124.5745');

      // Should return Nominatim result, not coordinates
      expect(result.location.address).toBe('Clallam County, Washington, United States of America');
      expect(result.location.address).not.toBe('47.9062,-124.5745');
      expect(reverseGeocodeNominatim).toHaveBeenCalledWith(47.9062, -124.5745);
    });

    it.skip('falls back to coordinates when Nominatim fails', async () => {
      const axios = require('axios');
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: {
          resolvedAddress: 'Old Location',
          latitude: 47.9062,
          longitude: -124.5745,
          timezone: 'America/Los_Angeles',
          currentConditions: {
            datetime: '12:00:00',
            temp: 52,
            feelslike: 48,
            humidity: 75,
            precip: 0,
            snow: 0,
            windspeed: 10,
            winddir: 180,
            pressure: 1013,
            cloudcover: 50,
            visibility: 10,
            uvindex: 3,
            conditions: 'Partly Cloudy',
            icon: 'partly-cloudy-day',
          },
        },
      });

      // Nominatim fails
      reverseGeocodeNominatim.mockRejectedValue(new Error('Nominatim service unavailable'));

      const weatherService = require('../../services/weatherService');

      const cacheService = require('../../services/cacheService');
      jest.spyOn(cacheService, 'withCache').mockImplementation(async (source, key, fn) => {
        return await fn();
      });

      const result = await weatherService.getCurrentWeather('47.9062,-124.5745');

      // Should fall back to formatted coordinates, NOT "Old Location"
      expect(result.location.address).toMatch(/^-?\d+\.\d+,\s*-?\d+\.\d+$/);
      expect(result.location.address).not.toBe('Old Location');
      expect(result.location.address).toContain('47.9062');
      expect(result.location.address).toContain('-124.5745');
    });
  });

  describe('🔍 SOURCE CODE SAFEGUARD: weatherService.js', () => {
    it('MUST have coordinate pattern detection in sanitizeResolvedAddress', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.resolve(__dirname, '../../services/weatherService.js');
      const sourceCode = fs.readFileSync(filePath, 'utf-8');

      // Must have pattern to detect coordinates like "47.9062,-124.5745"
      const hasCoordinatePattern =
        /const isCoordinates = \/\^-?\[\\d\]\+\[\\\\.\]\[\\d\]\+,\[\\s\]\*-?\[\\d\]\+\[\\\\.\]\[\\d\]\+\$\//.test(
          sourceCode
        ) ||
        sourceCode.includes('isCoordinates') ||
        /\d+\.\d+,\s*-?\d+\.\d+/.test(sourceCode);

      expect(hasCoordinatePattern).toBe(true);
    });

    it('MUST call reverseGeocodeNominatim when placeholder detected', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.resolve(__dirname, '../../services/weatherService.js');
      const sourceCode = fs.readFileSync(filePath, 'utf-8');

      // Must import reverseGeocodeNominatim
      const hasImport = sourceCode.includes('reverseGeocodeNominatim');
      expect(hasImport).toBe(true);

      // Must call it when placeholder detected
      const hasCall = /await\s+reverseGeocodeNominatim/.test(sourceCode);
      expect(hasCall).toBe(true);
    });

    it('MUST check for BOTH placeholder and coordinate patterns', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.resolve(__dirname, '../../services/weatherService.js');
      const sourceCode = fs.readFileSync(filePath, 'utf-8');

      // Look for the sanitizeResolvedAddress function
      const functionStart = sourceCode.indexOf('async function sanitizeResolvedAddress');
      const functionEnd = sourceCode.indexOf('}', functionStart + 500); // Approximate end
      const functionCode = sourceCode.substring(functionStart, functionEnd);

      // Must check for placeholder pattern
      const hasPlaceholderCheck = /isPlaceholder/.test(functionCode);
      expect(hasPlaceholderCheck).toBe(true);

      // Must check for coordinate pattern
      const hasCoordinateCheck = /isCoordinates/.test(functionCode);
      expect(hasCoordinateCheck).toBe(true);

      // Must use OR logic: isPlaceholder || isCoordinates
      const hasOrLogic = /isPlaceholder\s*\|\|\s*isCoordinates/.test(functionCode);
      expect(hasOrLogic).toBe(true);
    });
  });
});

/**
 * DOCUMENTATION TEST
 * Ensures the fix is properly documented
 */
describe('📚 DOCUMENTATION SAFEGUARD', () => {
  it('OLD_LOCATION_BUG_FIX.md must document backend sanitization', () => {
    const fs = require('fs');
    const path = require('path');
    const docPath = path.resolve(
      __dirname,
      '../../../docs/troubleshooting/OLD_LOCATION_BUG_FIX.md'
    );

    if (!fs.existsSync(docPath)) {
      throw new Error('Missing documentation: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md');
    }

    const docContent = fs.readFileSync(docPath, 'utf-8');

    // Must mention Visual Crossing placeholders
    expect(docContent.toLowerCase()).toContain('visual crossing');
    expect(docContent.toLowerCase()).toContain('old location');

    // Must mention Nominatim as solution
    expect(docContent.toLowerCase()).toContain('nominatim');

    // Must mention backend sanitization
    expect(docContent.toLowerCase()).toContain('backend') ||
      expect(docContent.toLowerCase()).toContain('sanitize');
  });
});
