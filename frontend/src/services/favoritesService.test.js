/**
 * Tests for favoritesService.js
 * Testing localStorage-based favorites management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  clearFavorites,
  reorderFavorites,
} from './favoritesService';

describe('Favorites Service', () => {
  const mockLocation1 = {
    address: 'London, UK',
    latitude: 51.5074,
    longitude: -0.1278,
  };

  const mockLocation2 = {
    address: 'Paris, France',
    latitude: 48.8566,
    longitude: 2.3522,
  };

  const mockFavorites = [
    {
      ...mockLocation1,
      addedAt: '2025-10-20T12:00:00.000Z',
      id: '51.5074,-0.1278',
    },
    {
      ...mockLocation2,
      addedAt: '2025-10-21T12:00:00.000Z',
      id: '48.8566,2.3522',
    },
  ];

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock console.error to avoid cluttering test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error mock
    console.error.mockRestore();
  });

  describe('getFavorites', () => {
    it('returns empty array when no favorites stored', () => {
      const result = getFavorites();

      expect(result).toEqual([]);
    });

    it('returns parsed favorites from localStorage', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify(mockFavorites));

      const result = getFavorites();

      expect(result).toEqual(mockFavorites);
      expect(result).toHaveLength(2);
    });

    it('handles localStorage errors gracefully', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage unavailable');
      });

      const result = getFavorites();

      expect(console.error).toHaveBeenCalledWith('Error loading favorites:', expect.any(Error));
      expect(result).toEqual([]);

      localStorage.getItem = originalGetItem;
    });

    it('handles invalid JSON gracefully', () => {
      localStorage.setItem('meteo_favorites', 'invalid json{]');

      const result = getFavorites();

      expect(console.error).toHaveBeenCalledWith('Error loading favorites:', expect.any(Error));
      expect(result).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('adds new favorite successfully', () => {
      const result = addFavorite(mockLocation1);

      expect(result).toBe(true);

      // Verify the saved data structure
      const savedData = JSON.parse(localStorage.getItem('meteo_favorites'));
      expect(savedData).toHaveLength(1);
      expect(savedData[0]).toMatchObject({
        address: 'London, UK',
        latitude: 51.5074,
        longitude: -0.1278,
        id: '51.5074,-0.1278',
      });
      expect(savedData[0]).toHaveProperty('addedAt');
    });

    it('adds favorite to existing list', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify([mockFavorites[0]]));

      const result = addFavorite(mockLocation2);

      expect(result).toBe(true);

      const savedData = JSON.parse(localStorage.getItem('meteo_favorites'));
      expect(savedData).toHaveLength(2);
      expect(savedData[1]).toMatchObject(mockLocation2);
    });

    it('prevents duplicate favorites', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify(mockFavorites));

      const result = addFavorite(mockLocation1);

      expect(result).toBe(false);
    });

    it('handles localStorage errors', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const result = addFavorite(mockLocation1);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error adding favorite:', expect.any(Error));

      localStorage.setItem = originalSetItem;
    });

    it('generates correct ID format', () => {
      addFavorite(mockLocation1);

      const savedData = JSON.parse(localStorage.getItem('meteo_favorites'));
      expect(savedData[0].id).toBe('51.5074,-0.1278');
    });

    it('adds timestamp to favorites', () => {
      const beforeAdd = new Date().toISOString();

      addFavorite(mockLocation1);

      const savedData = JSON.parse(localStorage.getItem('meteo_favorites'));
      const afterAdd = new Date().toISOString();

      // Verify timestamp is in ISO format and within test duration
      expect(savedData[0].addedAt).toBeTruthy();
      expect(new Date(savedData[0].addedAt).toISOString()).toBe(savedData[0].addedAt);
      expect(savedData[0].addedAt >= beforeAdd && savedData[0].addedAt <= afterAdd).toBe(true);
    });
  });

  describe('removeFavorite', () => {
    it('removes favorite successfully', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify(mockFavorites));

      const result = removeFavorite('51.5074,-0.1278');

      expect(result).toBe(true);

      const savedData = JSON.parse(localStorage.getItem('meteo_favorites'));
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('48.8566,2.3522');
    });

    it('handles removing non-existent favorite', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify(mockFavorites));

      const result = removeFavorite('99.999,99.999');

      expect(result).toBe(true);

      const savedData = JSON.parse(localStorage.getItem('meteo_favorites'));
      expect(savedData).toHaveLength(2); // Nothing removed
    });

    it('handles empty favorites list', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify([]));

      const result = removeFavorite('51.5074,-0.1278');

      expect(result).toBe(true);

      const savedData = JSON.parse(localStorage.getItem('meteo_favorites'));
      expect(savedData).toEqual([]);
    });

    it('handles localStorage errors', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify(mockFavorites));
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      const result = removeFavorite('51.5074,-0.1278');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error removing favorite:', expect.any(Error));

      localStorage.setItem = originalSetItem;
    });
  });

  describe('isFavorite', () => {
    it('returns true for favorited location', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify(mockFavorites));

      const result = isFavorite(51.5074, -0.1278);

      expect(result).toBe(true);
    });

    it('returns false for non-favorited location', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify(mockFavorites));

      const result = isFavorite(99.999, 99.999);

      expect(result).toBe(false);
    });

    it('returns false for empty favorites', () => {
      const result = isFavorite(51.5074, -0.1278);

      expect(result).toBe(false);
    });

    it('handles exact coordinate matching', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify(mockFavorites));

      // Test with exact match
      expect(isFavorite(51.5074, -0.1278)).toBe(true);

      // Test with slightly different coordinates
      expect(isFavorite(51.5075, -0.1278)).toBe(false);
      expect(isFavorite(51.5074, -0.1279)).toBe(false);
    });
  });

  describe('clearFavorites', () => {
    it('clears all favorites successfully', () => {
      localStorage.setItem('meteo_favorites', JSON.stringify(mockFavorites));

      const result = clearFavorites();

      expect(result).toBe(true);
      expect(localStorage.getItem('meteo_favorites')).toBeNull();
    });

    it('handles localStorage errors', () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      const result = clearFavorites();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error clearing favorites:', expect.any(Error));

      localStorage.removeItem = originalRemoveItem;
    });

    it('works even when no favorites exist', () => {
      const result = clearFavorites();

      expect(result).toBe(true);
      expect(localStorage.getItem('meteo_favorites')).toBeNull();
    });
  });

  describe('reorderFavorites', () => {
    it('reorders favorites successfully', () => {
      const reordered = [mockFavorites[1], mockFavorites[0]];

      const result = reorderFavorites(reordered);

      expect(result).toBe(true);
      expect(localStorage.getItem('meteo_favorites')).toBe(JSON.stringify(reordered));
    });

    it('handles empty array', () => {
      const result = reorderFavorites([]);

      expect(result).toBe(true);
      expect(localStorage.getItem('meteo_favorites')).toBe(JSON.stringify([]));
    });

    it('handles localStorage errors', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      const result = reorderFavorites(mockFavorites);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error reordering favorites:', expect.any(Error));

      localStorage.setItem = originalSetItem;
    });

    it('overwrites existing favorites with new order', () => {
      // First, verify initial order
      localStorage.setItem('meteo_favorites', JSON.stringify(mockFavorites));

      const initialFavorites = getFavorites();
      expect(initialFavorites[0].id).toBe('51.5074,-0.1278');

      // Reorder
      const reversed = [...mockFavorites].reverse();
      reorderFavorites(reversed);

      // Verify saved data has new order
      const savedData = JSON.parse(localStorage.getItem('meteo_favorites'));
      expect(savedData[0].id).toBe('48.8566,2.3522');
    });
  });

  describe('Integration Tests', () => {
    it('performs full workflow: add, check, remove, verify', () => {
      // Start with empty favorites (localStorage is already cleared in beforeEach)

      // Add favorite
      const added = addFavorite(mockLocation1);
      expect(added).toBe(true);

      // Check if favorite
      expect(isFavorite(51.5074, -0.1278)).toBe(true);

      // Remove favorite
      const removed = removeFavorite('51.5074,-0.1278');
      expect(removed).toBe(true);

      // Verify removal
      expect(isFavorite(51.5074, -0.1278)).toBe(false);
    });

    it('handles multiple adds and removes', () => {
      // Add first location
      addFavorite(mockLocation1);

      // Add second location
      addFavorite(mockLocation2);

      // Verify both exist
      expect(isFavorite(51.5074, -0.1278)).toBe(true);
      expect(isFavorite(48.8566, 2.3522)).toBe(true);

      // Remove first
      removeFavorite('51.5074,-0.1278');

      // Verify first removed, second remains
      expect(isFavorite(51.5074, -0.1278)).toBe(false);
      expect(isFavorite(48.8566, 2.3522)).toBe(true);
    });
  });
});
