/**
 * @jest-environment jsdom
 */

import { createLocationSlug, parseLocationSlug } from './urlHelpers';

describe('urlHelpers', () => {
  describe('createLocationSlug', () => {
    it('converts simple city name to slug', () => {
      expect(createLocationSlug('Seattle')).toBe('seattle');
    });

    it('converts city and state to slug', () => {
      expect(createLocationSlug('Seattle, WA')).toBe('seattle-wa');
    });

    it('converts full address to slug', () => {
      expect(createLocationSlug('Seattle, WA, USA')).toBe('seattle-wa-usa');
    });

    it('handles special characters by removing them', () => {
      expect(createLocationSlug('São Paulo, Brazil')).toBe('so-paulo-brazil');
      expect(createLocationSlug("New York's Best City!")).toBe('new-yorks-best-city');
    });

    it('replaces multiple spaces with single hyphen', () => {
      expect(createLocationSlug('New    York    City')).toBe('new-york-city');
    });

    it('replaces multiple hyphens with single hyphen', () => {
      expect(createLocationSlug('New---York---City')).toBe('new-york-city');
    });

    it('trims whitespace from edges', () => {
      expect(createLocationSlug('  Seattle, WA  ')).toBe('seattle-wa');
    });

    it('handles empty string', () => {
      expect(createLocationSlug('')).toBe('');
    });

    it('handles null/undefined', () => {
      expect(createLocationSlug(null)).toBe('');
      expect(createLocationSlug(undefined)).toBe('');
    });

    it('converts uppercase to lowercase', () => {
      expect(createLocationSlug('NEW YORK CITY')).toBe('new-york-city');
    });

    it('handles numbers in location names', () => {
      expect(createLocationSlug('Highway 101, California')).toBe('highway-101-california');
    });

    it('handles complex international addresses', () => {
      expect(createLocationSlug('München, Bayern, Germany')).toBe('mnchen-bayern-germany');
    });
  });

  describe('parseLocationSlug', () => {
    it('converts simple slug to search query', () => {
      expect(parseLocationSlug('seattle')).toBe('seattle');
    });

    it('converts slug with hyphens to search query', () => {
      expect(parseLocationSlug('seattle-wa')).toBe('seattle wa');
    });

    it('converts full address slug to search query', () => {
      expect(parseLocationSlug('seattle-wa-usa')).toBe('seattle wa usa');
    });

    it('handles multiple consecutive hyphens', () => {
      expect(parseLocationSlug('new---york')).toBe('new   york');
    });

    it('trims whitespace from result', () => {
      expect(parseLocationSlug('seattle-wa-')).toBe('seattle wa');
      expect(parseLocationSlug('-seattle-wa')).toBe('seattle wa');
    });

    it('handles empty string', () => {
      expect(parseLocationSlug('')).toBe('');
    });

    it('handles null/undefined', () => {
      expect(parseLocationSlug(null)).toBe('');
      expect(parseLocationSlug(undefined)).toBe('');
    });

    it('handles slug with no hyphens', () => {
      expect(parseLocationSlug('seattle')).toBe('seattle');
    });
  });

  describe('round-trip conversion', () => {
    it('preserves basic location after round-trip', () => {
      const original = 'Seattle, WA, USA';
      const slug = createLocationSlug(original);
      const parsed = parseLocationSlug(slug);

      // Won't match exactly due to special character removal,
      // but should be searchable
      expect(parsed).toBe('seattle wa usa');
    });

    it('handles multiple round-trips consistently', () => {
      const original = 'New York City';
      const slug1 = createLocationSlug(original);
      const parsed1 = parseLocationSlug(slug1);
      const slug2 = createLocationSlug(parsed1);
      const parsed2 = parseLocationSlug(slug2);

      // Should stabilize after first conversion
      expect(slug1).toBe(slug2);
      expect(parsed1).toBe(parsed2);
    });
  });

  describe('edge cases', () => {
    it('handles very long location names', () => {
      const longLocation = 'A'.repeat(200) + ', ' + 'B'.repeat(200);
      const slug = createLocationSlug(longLocation);

      expect(slug).toBeTruthy();
      expect(slug).toContain('a');
      expect(slug).toContain('b');
    });

    it('handles location with only special characters', () => {
      expect(createLocationSlug('!@#$%^&*()')).toBe('');
    });

    it('handles location with mixed case and numbers', () => {
      const location = 'Route 66, Arizona, USA';
      expect(createLocationSlug(location)).toBe('route-66-arizona-usa');
    });

    it('handles slug parsing with consecutive hyphens', () => {
      expect(parseLocationSlug('new--york--city')).toBe('new  york  city');
    });
  });
});
