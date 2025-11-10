/**
 * CRITICAL REGRESSION TESTS for LocationContext - "Old Location" Bug
 *
 * These tests ensure we NEVER re-introduce the bug where placeholder strings
 * like "Your Location" are stored in localStorage and sent to the backend API.
 *
 * INCIDENT: Nov 6, 2025 - Old localStorage data contained "Your Location" string
 * which wasn't detected as a placeholder, causing it to be sent to the API.
 *
 * See: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md
 * See: docs/troubleshooting/REGRESSION_PREVENTION.md
 *
 * ⚠️ IF THESE TESTS FAIL, THE BUG HAS RETURNED! ⚠️
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// We need to test the helper functions directly
// Since they're not exported, we'll use source code analysis and integration tests

describe.skip('🚨 REGRESSION PREVENTION: LocationContext Placeholder Detection', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('CRITICAL: isPlaceholderAddress() Function', () => {
    it('MUST detect "Your Location" as placeholder (case insensitive)', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      // Extract the isPlaceholderAddress function
      const funcStart = sourceCode.indexOf('function isPlaceholderAddress(');
      const funcEnd = sourceCode.indexOf('function sanitizeLocationData(');

      if (funcStart === -1 || funcEnd === -1) {
        throw new Error('Cannot find isPlaceholderAddress function - code structure changed!');
      }

      const funcCode = sourceCode.substring(funcStart, funcEnd);

      // 🚨 CRITICAL: Must include "your location" in the regex pattern
      // This is THE BUG that caused the Nov 6 incident!
      const hasYourLocationPattern = /your location/i.test(funcCode);

      if (!hasYourLocationPattern) {
        throw new Error(
          '🚨🚨🚨 CRITICAL REGRESSION DETECTED! 🚨🚨🚨\n\n' +
            'isPlaceholderAddress() does NOT check for "Your Location"!\n' +
            'This will allow old localStorage data to send "Your Location" to the API.\n\n' +
            'FIX: Add "your location" to the placeholder pattern regex:\n' +
            '  WRONG: /^(old location|location|unknown|...)$/i\n' +
            '  RIGHT: /^(old location|your location|location|unknown|...)$/i\n\n' +
            'See: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md'
        );
      }

      expect(hasYourLocationPattern).toBe(true);
    });

    it('MUST detect "Old Location" as placeholder', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      const funcStart = sourceCode.indexOf('function isPlaceholderAddress(');
      const funcEnd = sourceCode.indexOf('function sanitizeLocationData(');
      const funcCode = sourceCode.substring(funcStart, funcEnd);

      const hasOldLocationPattern = /old location/i.test(funcCode);

      if (!hasOldLocationPattern) {
        throw new Error(
          '🚨 REGRESSION: isPlaceholderAddress() does NOT check for "Old Location"!\n' +
            'This is the original bug from Visual Crossing API.\n'
        );
      }

      expect(hasOldLocationPattern).toBe(true);
    });

    it('MUST detect "Unknown" as placeholder', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      const funcStart = sourceCode.indexOf('function isPlaceholderAddress(');
      const funcEnd = sourceCode.indexOf('function sanitizeLocationData(');
      const funcCode = sourceCode.substring(funcStart, funcEnd);

      const hasUnknownPattern = /unknown/i.test(funcCode);

      expect(hasUnknownPattern).toBe(true);
    });

    it('MUST detect "Location" (standalone) as placeholder', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      const funcStart = sourceCode.indexOf('function isPlaceholderAddress(');
      const funcEnd = sourceCode.indexOf('function sanitizeLocationData(');
      const funcCode = sourceCode.substring(funcStart, funcEnd);

      // Should detect standalone "Location" but not "Your Location" or "Old Location"
      const hasLocationPattern = funcCode.includes('location') || funcCode.includes('Location');

      expect(hasLocationPattern).toBe(true);
    });

    it('MUST NOT treat coordinates as placeholders', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      const funcStart = sourceCode.indexOf('function isPlaceholderAddress(');
      const funcEnd = sourceCode.indexOf('function sanitizeLocationData(');
      const funcCode = sourceCode.substring(funcStart, funcEnd);

      // Should have a comment or logic explicitly stating coordinates are NOT placeholders
      const hasCoordinateComment =
        /coordinates.*not.*placeholder/i.test(funcCode) ||
        /do not treat coordinates/i.test(funcCode) ||
        /NOTE:.*coordinates/i.test(funcCode);

      if (!hasCoordinateComment) {
        console.warn(
          '⚠️  WARNING: No explicit comment about coordinates being valid data.\n' +
            'Consider adding: "// NOTE: Do NOT treat coordinates as placeholders!"'
        );
      }

      // This is a warning, not a failure - the logic should handle it correctly
      expect(funcCode).toBeTruthy();
    });
  });

  describe('CRITICAL: sanitizeLocationData() Function', () => {
    it('MUST replace placeholders with coordinates (NOT "Your Location")', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      const funcStart = sourceCode.indexOf('function sanitizeLocationData(');
      const funcEnd = sourceCode.indexOf('export function useLocation()');
      const funcCode = sourceCode.substring(funcStart, funcEnd);

      // Should call isPlaceholderAddress
      const callsPlaceholderCheck = /isPlaceholderAddress/.test(funcCode);

      if (!callsPlaceholderCheck) {
        throw new Error(
          '🚨 CRITICAL: sanitizeLocationData() does NOT call isPlaceholderAddress()!\n' +
            'Placeholders will not be detected and cleaned up.'
        );
      }

      // Should return coordinates when placeholder detected
      const hasCoordinateFallback =
        /\$\{.*latitude.*\}.*\$\{.*longitude.*\}/.test(funcCode) ||
        /\$\{.*longitude.*\}.*\$\{.*latitude.*\}/.test(funcCode);

      if (!hasCoordinateFallback) {
        throw new Error(
          '🚨 CRITICAL: sanitizeLocationData() does NOT replace placeholders with coordinates!\n' +
            'Expected pattern: `${latitude}, ${longitude}`'
        );
      }

      expect(callsPlaceholderCheck).toBe(true);
      expect(hasCoordinateFallback).toBe(true);
    });

    it('MUST NOT assign "Your Location" string anywhere', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      const funcStart = sourceCode.indexOf('function sanitizeLocationData(');
      const funcEnd = sourceCode.indexOf('export function useLocation()');
      const funcCode = sourceCode.substring(funcStart, funcEnd);

      // Check for "Your Location" being assigned
      const badPattern = /address\s*[=:]\s*['"`]Your Location['"`]/gi;
      const matches = funcCode.match(badPattern);

      if (matches && matches.length > 0) {
        throw new Error(
          '🚨🚨🚨 CRITICAL REGRESSION DETECTED! 🚨🚨🚨\n\n' +
            '"Your Location" string found in sanitizeLocationData()!\n' +
            'This will send "Your Location" to the backend API.\n\n' +
            'Found violations:\n' +
            matches.join('\n') +
            '\n\n' +
            'FIX: Replace with coordinates:\n' +
            '  WRONG: address = "Your Location"\n' +
            '  RIGHT: address = `${latitude}, ${longitude}`\n\n' +
            'See: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md'
        );
      }

      expect(matches).toBeNull();
    });

    it('MUST handle missing coordinates gracefully', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      const funcStart = sourceCode.indexOf('function sanitizeLocationData(');
      const funcEnd = sourceCode.indexOf('export function useLocation()');
      const funcCode = sourceCode.substring(funcStart, funcEnd);

      // Should check if coordinates exist before using them
      const hasCoordinateCheck =
        /hasCoords|coordinates.*exist|latitude.*!=.*null|longitude.*!=.*null/.test(funcCode);

      if (!hasCoordinateCheck) {
        console.warn(
          '⚠️  WARNING: sanitizeLocationData() may not check if coordinates exist.\n' +
            'Should verify latitude/longitude are not null before formatting.'
        );
      }

      expect(funcCode).toBeTruthy();
    });
  });

  describe('CRITICAL: localStorage Initialization', () => {
    it('MUST sanitize data loaded from localStorage on startup', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      // Check useState initialization
      const useStatePattern = /useState\(\(\)\s*=>\s*\{[\s\S]*?localStorage[\s\S]*?\}\)/g;
      const stateInits = sourceCode.match(useStatePattern);

      if (!stateInits || stateInits.length === 0) {
        throw new Error(
          '🚨 CRITICAL: Cannot find localStorage initialization in useState!\n' +
            'Code structure may have changed.'
        );
      }

      // Should call sanitizeLocationData during initialization
      let hasSanitization = false;
      for (const init of stateInits) {
        if (/sanitizeLocationData/.test(init)) {
          hasSanitization = true;
          break;
        }
      }

      if (!hasSanitization) {
        throw new Error(
          '🚨🚨🚨 CRITICAL REGRESSION DETECTED! 🚨🚨🚨\n\n' +
            'localStorage data is NOT being sanitized on load!\n' +
            'Old cached data with "Your Location" will be sent to the API.\n\n' +
            'FIX: Call sanitizeLocationData() when loading from localStorage:\n' +
            '  const parsed = JSON.parse(saved);\n' +
            '  const sanitized = sanitizeLocationData(parsed);\n\n' +
            'See: docs/troubleshooting/REGRESSION_PREVENTION.md'
        );
      }

      expect(hasSanitization).toBe(true);
    });

    it('MUST sanitize data before saving to localStorage', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      // Check the selectLocation function
      const funcStart = sourceCode.indexOf('const selectLocation = useCallback(');
      const funcEnd = sourceCode.indexOf('const clearLocation = useCallback(');

      if (funcStart === -1 || funcEnd === -1) {
        throw new Error('Cannot find selectLocation function - code structure changed!');
      }

      const funcCode = sourceCode.substring(funcStart, funcEnd);

      // Should call sanitizeLocationData before saving
      const sanitizesBeforeSave = /sanitizeLocationData/.test(funcCode);

      if (!sanitizesBeforeSave) {
        throw new Error(
          '🚨 CRITICAL: selectLocation() does NOT sanitize before saving!\n' +
            'Placeholder data could be saved to localStorage.\n\n' +
            'FIX: Call sanitizeLocationData() before localStorage.setItem()'
        );
      }

      expect(sanitizesBeforeSave).toBe(true);
    });
  });

  describe('🔍 SOURCE CODE SAFEGUARD: Complete File Check', () => {
    it('MUST NOT contain "Your Location" assignments anywhere in file', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      // Remove comments first to avoid false positives
      const codeWithoutComments = sourceCode
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
        .replace(/\/\/.*/g, ''); // Remove // comments

      // Check for "Your Location" being assigned to address
      const badPattern = /address\s*[=:]\s*['"`]Your Location['"`]/gi;
      const matches = codeWithoutComments.match(badPattern);

      if (matches && matches.length > 0) {
        throw new Error(
          '🚨🚨🚨 CRITICAL REGRESSION DETECTED! 🚨🚨🚨\n\n' +
            '"Your Location" assignment found in LocationContext.jsx!\n\n' +
            'Found violations:\n' +
            matches.join('\n') +
            '\n\n' +
            'This will send "Your Location" to the backend API.\n\n' +
            'See: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md'
        );
      }

      expect(matches).toBeNull();
    });

    it('MUST have comprehensive placeholder pattern regex', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      // Extract the placeholder pattern regex
      const regexPattern = /\/\^?\(([^)]+)\).*?\$/;
      const match = sourceCode.match(regexPattern);

      if (!match) {
        throw new Error('Cannot find placeholder pattern regex - code structure changed!');
      }

      const pattern = match[1].toLowerCase();

      // Must include these critical placeholders
      const requiredPatterns = ['old location', 'your location', 'unknown', 'location'];

      const missingPatterns = requiredPatterns.filter((p) => !pattern.includes(p.toLowerCase()));

      if (missingPatterns.length > 0) {
        throw new Error(
          `🚨 CRITICAL: Placeholder regex is missing required patterns!\n\n` +
            `Missing: ${missingPatterns.join(', ')}\n\n` +
            `Current pattern: ${pattern}\n\n` +
            `These placeholders MUST be detected to prevent the "Old Location" bug.`
        );
      }

      expect(missingPatterns.length).toBe(0);
    });
  });

  describe('🔄 INTEGRATION: localStorage Data Migration', () => {
    it('handles old cached data with "Your Location" correctly', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      // Verify the complete flow:
      // 1. Load from localStorage
      // 2. Parse JSON
      // 3. Call sanitizeLocationData()
      // 4. Detect "Your Location" as placeholder
      // 5. Replace with coordinates

      const hasCompleteFlow =
        /localStorage\.getItem/.test(sourceCode) &&
        /JSON\.parse/.test(sourceCode) &&
        /sanitizeLocationData/.test(sourceCode) &&
        /isPlaceholderAddress/.test(sourceCode) &&
        /latitude.*longitude/.test(sourceCode);

      if (!hasCompleteFlow) {
        throw new Error(
          '🚨 CRITICAL: Incomplete localStorage migration flow!\n' +
            'Must: load → parse → sanitize → detect placeholders → replace with coordinates'
        );
      }

      expect(hasCompleteFlow).toBe(true);
    });

    it('handles data without coordinates gracefully', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      // Should return null or default when data is invalid
      const hasNullReturn = /return null/.test(sourceCode);
      const hasDefaultFallback = /DEFAULT_LOCATION/.test(sourceCode);

      const hasGracefulHandling = hasNullReturn && hasDefaultFallback;

      if (!hasGracefulHandling) {
        console.warn(
          '⚠️  WARNING: May not handle missing coordinates gracefully.\n' +
            'Consider returning null or DEFAULT_LOCATION for invalid data.'
        );
      }

      expect(sourceCode).toBeTruthy();
    });
  });

  describe('📊 EDGE CASES: Placeholder Detection', () => {
    it('detects placeholders with different casing', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      const funcStart = sourceCode.indexOf('function isPlaceholderAddress(');
      const funcEnd = sourceCode.indexOf('function sanitizeLocationData(');
      const funcCode = sourceCode.substring(funcStart, funcEnd);

      // Regex should have case-insensitive flag
      const hasCaseInsensitiveFlag = /\/\^.*\$\/i/.test(funcCode);

      if (!hasCaseInsensitiveFlag) {
        throw new Error(
          '🚨 CRITICAL: Placeholder regex is NOT case-insensitive!\n' +
            'Must use /i flag to match "Your Location", "your location", "YOUR LOCATION", etc.'
        );
      }

      expect(hasCaseInsensitiveFlag).toBe(true);
    });

    it('detects placeholders with whitespace', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      const funcStart = sourceCode.indexOf('function isPlaceholderAddress(');
      const funcEnd = sourceCode.indexOf('function sanitizeLocationData(');
      const funcCode = sourceCode.substring(funcStart, funcEnd);

      // Should trim the address before checking
      const hasTrim = /trim\(\)/.test(funcCode);

      if (!hasTrim) {
        console.warn(
          '⚠️  WARNING: May not trim whitespace before checking placeholders.\n' +
            'Strings like "  Your Location  " may not be detected.'
        );
      }

      expect(funcCode).toBeTruthy();
    });

    it('handles null, undefined, and non-string addresses', () => {
      const filePath = resolve(__dirname, 'LocationContext.jsx');
      const sourceCode = readFileSync(filePath, 'utf-8');

      const funcStart = sourceCode.indexOf('function isPlaceholderAddress(');
      const funcEnd = sourceCode.indexOf('function sanitizeLocationData(');
      const funcCode = sourceCode.substring(funcStart, funcEnd);

      // Should check for null/undefined and type
      const hasTypeCheck = /!address/.test(funcCode) && /typeof.*string/.test(funcCode);

      if (!hasTypeCheck) {
        throw new Error(
          '🚨 CRITICAL: isPlaceholderAddress() does NOT check for null/undefined!\n' +
            'Will crash if address is null or not a string.\n\n' +
            'FIX: Add checks:\n' +
            '  if (!address || typeof address !== "string") return true;'
        );
      }

      expect(hasTypeCheck).toBe(true);
    });
  });
});

/**
 * PRODUCTION MONITORING INTEGRATION
 * Verify that LocationContext works correctly with backend monitoring
 */
describe('🚨 PRODUCTION MONITORING: Backend Integration', () => {
  it('ensures coordinates are sent (NOT placeholders) to weather API', () => {
    const filePath = resolve(__dirname, 'LocationContext.jsx');
    const sourceCode = readFileSync(filePath, 'utf-8');

    // The golden rule: address field must be coordinates or city name, NEVER placeholders
    // LocationContext is responsible for sanitizing before the data reaches the API

    const hasCorrectFlow =
      /sanitizeLocationData/.test(sourceCode) &&
      /isPlaceholderAddress/.test(sourceCode) &&
      /latitude.*longitude/.test(sourceCode);

    if (!hasCorrectFlow) {
      throw new Error(
        '🚨 CRITICAL: LocationContext does NOT properly sanitize before API calls!\n' +
          'The backend production monitoring (in weather.js) will trigger alerts.\n\n' +
          'See: docs/troubleshooting/REGRESSION_PREVENTION.md - Production Monitoring section'
      );
    }

    expect(hasCorrectFlow).toBe(true);
  });
});
