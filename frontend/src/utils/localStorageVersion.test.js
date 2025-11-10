/**
 * Tests for localStorage Versioning System
 *
 * Ensures that data migration works correctly and prevents
 * the "Old Location" bug from returning via cached data
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_VERSION,
  VERSION_KEY,
  getStorageVersion,
  setStorageVersion,
  loadVersionedData,
  saveVersionedData,
  clearVersionedData,
  needsMigration,
  getMigrationInfo,
} from './localStorageVersion';

describe('localStorage Versioning System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Version Management', () => {
    it('should return 0 when no version is set', () => {
      const version = getStorageVersion();
      expect(version).toBe(0);
    });

    it('should set and get storage version correctly', () => {
      setStorageVersion(2);
      const version = getStorageVersion();
      expect(version).toBe(2);
    });

    it('should handle invalid version gracefully', () => {
      localStorage.setItem(VERSION_KEY, 'invalid');
      const version = getStorageVersion();
      expect(version).toBe(0); // Should return 0 for invalid
    });
  });

  describe('Migration Detection', () => {
    it('should detect when migration is needed', () => {
      setStorageVersion(1);
      expect(needsMigration()).toBe(true);
    });

    it('should detect when data is up to date', () => {
      setStorageVersion(STORAGE_VERSION);
      expect(needsMigration()).toBe(false);
    });

    it('should return correct migration info', () => {
      setStorageVersion(1);
      const info = getMigrationInfo();

      expect(info.currentVersion).toBe(1);
      expect(info.expectedVersion).toBe(STORAGE_VERSION);
      expect(info.needsMigration).toBe(true);
      expect(info.isDowngrade).toBe(false);
      expect(info.isUpToDate).toBe(false);
    });

    it('should detect downgrade scenario', () => {
      setStorageVersion(99); // Future version
      const info = getMigrationInfo();

      expect(info.isDowngrade).toBe(true);
      expect(info.needsMigration).toBe(false);
    });
  });

  describe('V1 to V2 Migration', () => {
    it('should migrate v1 data with "Your Location" placeholder', () => {
      const v1Data = {
        address: 'Your Location',
        latitude: 47.6062,
        longitude: -122.3321,
        location_name: 'Seattle',
        timezone: 'America/Los_Angeles',
      };

      localStorage.setItem('test_key', JSON.stringify(v1Data));

      const migrated = loadVersionedData('test_key');

      expect(migrated).toBeTruthy();
      expect(migrated.version).toBe(2);
      expect(migrated.address).not.toBe('Your Location');
      expect(migrated.address).toMatch(/47\.6062.*-122\.3321/);
      expect(migrated.latitude).toBe(47.6062);
      expect(migrated.longitude).toBe(-122.3321);
    });

    it('should migrate v1 data with "Old Location" placeholder', () => {
      const v1Data = {
        address: 'Old Location',
        latitude: -28.2179,
        longitude: 28.3176,
      };

      localStorage.setItem('test_key', JSON.stringify(v1Data));

      const migrated = loadVersionedData('test_key');

      expect(migrated).toBeTruthy();
      expect(migrated.version).toBe(2);
      expect(migrated.address).not.toBe('Old Location');
      expect(migrated.address).toMatch(/-28\.2179.*28\.3176/);
    });

    it('should migrate v1 data with valid city name unchanged', () => {
      const v1Data = {
        address: 'Seattle, WA',
        latitude: 47.6062,
        longitude: -122.3321,
        location_name: 'Seattle',
      };

      localStorage.setItem('test_key', JSON.stringify(v1Data));

      const migrated = loadVersionedData('test_key');

      expect(migrated).toBeTruthy();
      expect(migrated.version).toBe(2);
      expect(migrated.address).toBe('Seattle, WA'); // Should NOT change
      expect(migrated.latitude).toBe(47.6062);
    });

    it('should discard v1 data with placeholder but no coordinates', () => {
      const v1Data = {
        address: 'Your Location',
        // NO coordinates
      };

      localStorage.setItem('test_key', JSON.stringify(v1Data));

      const migrated = loadVersionedData('test_key');

      expect(migrated).toBeNull();
      // Should also clear the invalid data
      expect(localStorage.getItem('test_key')).toBeNull();
    });

    it('should handle case-insensitive placeholder detection', () => {
      const testCases = [
        'YOUR LOCATION',
        'your location',
        'YoUr LoCaTiOn',
        'OLD LOCATION',
        'old location',
        'UNKNOWN',
        'unknown',
      ];

      testCases.forEach((placeholder) => {
        localStorage.clear();

        const v1Data = {
          address: placeholder,
          latitude: 40.7128,
          longitude: -74.006,
        };

        localStorage.setItem('test_key', JSON.stringify(v1Data));
        const migrated = loadVersionedData('test_key');

        expect(migrated).toBeTruthy();
        expect(migrated.address).not.toBe(placeholder);
        expect(migrated.address).toMatch(/40\.7128.*-74\.006/);
      });
    });
  });

  describe('Save Versioned Data', () => {
    it('should save data with version stamp', () => {
      const data = {
        address: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.006,
      };

      const success = saveVersionedData('test_key', data);

      expect(success).toBe(true);

      const saved = JSON.parse(localStorage.getItem('test_key'));
      expect(saved.version).toBe(STORAGE_VERSION);
      expect(saved.address).toBe('New York, NY');
      expect(saved.latitude).toBe(40.7128);
    });

    it('should update version when saving', () => {
      setStorageVersion(1); // Old version

      saveVersionedData('test_key', { address: 'Test' });

      const version = getStorageVersion();
      expect(version).toBe(STORAGE_VERSION);
    });
  });

  describe('Load Versioned Data', () => {
    it('should load v2 data without migration', () => {
      const v2Data = {
        version: 2,
        address: 'Boston, MA',
        latitude: 42.3601,
        longitude: -71.0589,
      };

      localStorage.setItem('test_key', JSON.stringify(v2Data));

      const loaded = loadVersionedData('test_key');

      expect(loaded).toEqual(v2Data);
    });

    it('should return null for non-existent key', () => {
      const loaded = loadVersionedData('nonexistent');
      expect(loaded).toBeNull();
    });

    it('should clear data if version is newer than expected (downgrade)', () => {
      const futureData = {
        version: 999,
        address: 'Future City',
      };

      localStorage.setItem('test_key', JSON.stringify(futureData));

      const loaded = loadVersionedData('test_key');

      expect(loaded).toBeNull();
      expect(localStorage.getItem('test_key')).toBeNull();
    });

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('test_key', 'not valid json {{{');

      const loaded = loadVersionedData('test_key');

      expect(loaded).toBeNull();
      // Should clear corrupted data
      expect(localStorage.getItem('test_key')).toBeNull();
    });
  });

  describe('Clear Versioned Data', () => {
    it('should clear data from localStorage', () => {
      localStorage.setItem('test_key', 'some data');

      clearVersionedData('test_key');

      expect(localStorage.getItem('test_key')).toBeNull();
    });
  });

  describe('Integration: Complete Migration Flow', () => {
    it('should migrate, save, and load correctly', () => {
      // Step 1: Start with v1 data with placeholder
      const v1Data = {
        address: 'Your Location',
        latitude: 34.0522,
        longitude: -118.2437,
        location_name: 'Los Angeles',
      };

      localStorage.setItem('location', JSON.stringify(v1Data));
      setStorageVersion(0);

      // Step 2: Load (should trigger migration)
      const migrated = loadVersionedData('location');

      expect(migrated.version).toBe(2);
      expect(migrated.address).toMatch(/34\.0522/);

      // Step 3: Save new data (should maintain version)
      const newData = {
        address: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
      };

      saveVersionedData('location', newData);

      // Step 4: Load again (should not need migration)
      const loaded = loadVersionedData('location');

      expect(loaded.version).toBe(2);
      expect(loaded.address).toBe('San Francisco, CA');
      expect(getStorageVersion()).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty object', () => {
      localStorage.setItem('test_key', JSON.stringify({}));

      const loaded = loadVersionedData('test_key');

      // Empty object with no version should be migrated
      expect(loaded).toBeNull();
    });

    it('should handle null latitude/longitude', () => {
      const data = {
        address: 'Test',
        latitude: null,
        longitude: null,
      };

      localStorage.setItem('test_key', JSON.stringify(data));

      const loaded = loadVersionedData('test_key');

      expect(loaded).toBeTruthy();
      expect(loaded.version).toBe(2);
    });

    it('should preserve extra fields during migration', () => {
      const v1Data = {
        address: 'Portland, OR',
        latitude: 45.5152,
        longitude: -122.6784,
        customField: 'custom value',
        anotherField: 123,
      };

      localStorage.setItem('test_key', JSON.stringify(v1Data));

      const migrated = loadVersionedData('test_key');

      expect(migrated.customField).toBe('custom value');
      expect(migrated.anotherField).toBe(123);
    });
  });

  describe('Logging and Debugging', () => {
    it('should log migration events', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const v1Data = {
        address: 'Your Location',
        latitude: 40,
        longitude: -74,
      };

      localStorage.setItem('test_key', JSON.stringify(v1Data));

      loadVersionedData('test_key');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Migrating localStorage from v')
      );

      consoleSpy.mockRestore();
    });

    it('should warn when clearing invalid data', () => {
      const consoleSpy = vi.spyOn(console, 'warn');

      const invalidData = {
        address: 'Your Location',
        // No coordinates - should be discarded
      };

      localStorage.setItem('test_key', JSON.stringify(invalidData));

      loadVersionedData('test_key');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
