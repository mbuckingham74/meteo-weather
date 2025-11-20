/**
 * Nearby City Suggestions Utility Tests
 * Tests for error recovery UX enhancement
 */

import { describe, it, expect } from 'vitest';
import {
  getNearbyCitySuggestions,
  formatLocationNotFoundMessage,
  isGenericQuery,
} from './nearbyCitySuggestions';

describe('nearbyCitySuggestions', () => {
  describe('getNearbyCitySuggestions', () => {
    it('should return empty array for blank/whitespace input', () => {
      expect(getNearbyCitySuggestions('')).toEqual([]);
      expect(getNearbyCitySuggestions('   ')).toEqual([]);
      expect(getNearbyCitySuggestions(null)).toEqual([]);
      expect(getNearbyCitySuggestions(undefined)).toEqual([]);
    });

    it('should return nearby cities for exact matches', () => {
      const suggestions = getNearbyCitySuggestions('new york');
      expect(suggestions).toHaveLength(4);
      expect(suggestions).toContain('Newark, NJ');
      expect(suggestions).toContain('Jersey City, NJ');
    });

    it('should handle case-insensitive matches', () => {
      const suggestions = getNearbyCitySuggestions('NEW YORK');
      expect(suggestions).toHaveLength(4);
      expect(suggestions[0]).toContain('Newark');
    });

    it('should handle queries with state/country suffixes', () => {
      const suggestions = getNearbyCitySuggestions('new york, ny');
      expect(suggestions).toHaveLength(4);
      expect(suggestions).toContain('Newark, NJ');
    });

    it('should find partial matches for queries >= 3 characters', () => {
      const suggestions = getNearbyCitySuggestions('york');
      expect(suggestions).toHaveLength(4);
      expect(suggestions[0]).toContain('NJ'); // Should match "new york" database
    });

    it('should return empty array for short queries (< 3 chars)', () => {
      const suggestions = getNearbyCitySuggestions('ny');
      expect(suggestions).toEqual([]);
    });

    it('should suggest coastal cities for beach/coast queries', () => {
      const suggestions = getNearbyCitySuggestions('beach city');
      expect(suggestions).toHaveLength(4);
      expect(suggestions).toContain('Miami, FL');
      expect(suggestions).toContain('San Diego, CA');
    });

    it('should suggest mountain cities for mountain/springs queries', () => {
      const suggestions = getNearbyCitySuggestions('mountain town');
      expect(suggestions).toHaveLength(4);
      expect(suggestions).toContain('Denver, CO');
      expect(suggestions).toContain('Salt Lake City, UT');
    });

    it('should return empty array for unknown cities with no hints', () => {
      const suggestions = getNearbyCitySuggestions('xyz');
      expect(suggestions).toEqual([]);
    });

    it('should handle queries with country names', () => {
      const suggestions = getNearbyCitySuggestions('london, uk');
      expect(suggestions).toHaveLength(4);
      expect(suggestions[0]).toContain('UK');
    });

    it('should find European cities', () => {
      const suggestions = getNearbyCitySuggestions('paris');
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toContain('France');
    });

    it('should find Asian cities', () => {
      const suggestions = getNearbyCitySuggestions('tokyo');
      expect(suggestions).toHaveLength(4);
      expect(suggestions).toContain('Yokohama, Japan');
    });

    it('should find Australian cities', () => {
      const suggestions = getNearbyCitySuggestions('sydney');
      expect(suggestions).toHaveLength(3);
      expect(suggestions).toContain('Parramatta, Australia');
    });
  });

  describe('formatLocationNotFoundMessage', () => {
    it('should format message with nearby cities when available', () => {
      const message = formatLocationNotFoundMessage('new york');
      expect(message).toContain('Try nearby cities:');
      expect(message).toContain('Newark, NJ');
    });

    it('should provide generic message when no suggestions available', () => {
      const message = formatLocationNotFoundMessage('xyz123');
      expect(message).toContain('Try adding the country or state');
      expect(message).not.toContain('nearby cities');
    });

    it('should handle blank input gracefully', () => {
      const message = formatLocationNotFoundMessage('');
      expect(message).toContain('Try adding the country or state');
    });
  });

  describe('isGenericQuery', () => {
    it('should identify single-word generic queries', () => {
      expect(isGenericQuery('springfield')).toBe(true);
      expect(isGenericQuery('portland')).toBe(true);
      expect(isGenericQuery('atlanta')).toBe(true);
    });

    it('should not flag well-known single-name cities', () => {
      expect(isGenericQuery('tokyo')).toBe(false);
      expect(isGenericQuery('beijing')).toBe(false);
      expect(isGenericQuery('london')).toBe(false);
      expect(isGenericQuery('paris')).toBe(false);
    });

    it('should not flag multi-word queries', () => {
      expect(isGenericQuery('new york')).toBe(false);
      expect(isGenericQuery('los angeles')).toBe(false);
      expect(isGenericQuery('springfield, ma')).toBe(false);
    });

    it('should not flag ZIP codes', () => {
      expect(isGenericQuery('12345')).toBe(false);
      expect(isGenericQuery('90210')).toBe(false);
    });

    it('should handle empty/null input', () => {
      expect(isGenericQuery('')).toBe(false);
      expect(isGenericQuery(null)).toBe(false);
      expect(isGenericQuery(undefined)).toBe(false);
    });
  });
});
