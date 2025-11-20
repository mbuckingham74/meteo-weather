/**
 * Date Range Hints Utility Tests
 * Tests for error recovery UX enhancement
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAvailableDateRange,
  formatDateRange,
  isDateAvailable,
  getNoDataSuggestion,
  getAlternativeDateSuggestions,
} from './dateRangeHints';

describe('dateRangeHints', () => {
  let today;

  beforeEach(() => {
    today = new Date();
  });

  describe('getAvailableDateRange', () => {
    it('should return correct range for current weather', () => {
      const range = getAvailableDateRange('current');
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
      expect(range.description).toContain('Current weather');
    });

    it('should return correct range for forecast (next 7 days)', () => {
      const range = getAvailableDateRange('forecast');
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);

      const daysDiff = Math.round((range.end - range.start) / (24 * 60 * 60 * 1000));
      expect(daysDiff).toBe(7);
      expect(range.description).toContain('7 days');
    });

    it('should return correct range for historical (past 5 years)', () => {
      const range = getAvailableDateRange('historical');
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);

      const yearsDiff = Math.round((range.end - range.start) / (365.25 * 24 * 60 * 60 * 1000));
      expect(yearsDiff).toBe(5);
      expect(range.description).toContain('5 years');
    });

    it('should return minYears for climate normals', () => {
      const range = getAvailableDateRange('climateNormals');
      expect(range.minYears).toBe(10);
      expect(range.description).toContain('10+ years');
    });

    it('should return historical range for unknown data type', () => {
      const range = getAvailableDateRange('unknown');
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
    });
  });

  describe('formatDateRange', () => {
    it('should format single date', () => {
      // Use local time to avoid timezone issues
      const date = new Date(2025, 0, 15); // Jan 15, 2025 in local time
      const formatted = formatDateRange(date, date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2025');
    });

    it('should format date range', () => {
      // Use local time to avoid timezone issues
      const start = new Date(2025, 0, 1); // Jan 1, 2025 in local time
      const end = new Date(2025, 11, 31); // Dec 31, 2025 in local time
      const formatted = formatDateRange(start, end);
      expect(formatted).toContain('Jan 1, 2025');
      expect(formatted).toContain('Dec 31, 2025');
      expect(formatted).toContain(' - ');
    });

    it('should handle missing end date', () => {
      const date = new Date('2025-01-15');
      const formatted = formatDateRange(date, null);
      expect(formatted).toContain('Jan');
      expect(formatted).not.toContain(' - ');
    });
  });

  describe('isDateAvailable', () => {
    it('should return true for today (current weather)', () => {
      expect(isDateAvailable(today, 'current')).toBe(true);
    });

    it('should return true for dates within forecast range', () => {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isDateAvailable(tomorrow, 'forecast')).toBe(true);

      const in3Days = new Date(today);
      in3Days.setDate(in3Days.getDate() + 3);
      expect(isDateAvailable(in3Days, 'forecast')).toBe(true);
    });

    it('should return false for dates beyond forecast range', () => {
      const in10Days = new Date(today);
      in10Days.setDate(in10Days.getDate() + 10);
      expect(isDateAvailable(in10Days, 'forecast')).toBe(false);
    });

    it('should return true for dates within historical range', () => {
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      expect(isDateAvailable(lastWeek, 'historical')).toBe(true);

      const lastYear = new Date(today);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      expect(isDateAvailable(lastYear, 'historical')).toBe(true);
    });

    it('should return false for dates beyond historical range', () => {
      const tenYearsAgo = new Date(today);
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      expect(isDateAvailable(tenYearsAgo, 'historical')).toBe(false);
    });
  });

  describe('getNoDataSuggestion', () => {
    it('should provide forecast-specific message for future dates beyond 7 days', () => {
      const in10Days = new Date(today);
      in10Days.setDate(in10Days.getDate() + 10);

      const suggestion = getNoDataSuggestion('forecast', in10Days);
      expect(suggestion).toContain('7 days');
      expect(suggestion).not.toContain('5 years');
    });

    it('should provide forecast-specific message for past dates', () => {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const suggestion = getNoDataSuggestion('forecast', yesterday);
      expect(suggestion).toContain('future dates');
      expect(suggestion).toContain('past');
    });

    it('should provide historical-specific message for dates too old', () => {
      const tenYearsAgo = new Date(today);
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

      const suggestion = getNoDataSuggestion('historical', tenYearsAgo);
      expect(suggestion).toContain('5 years');
      expect(suggestion).toContain('10 years ago');
    });

    it('should provide generic message without requested date', () => {
      const suggestion = getNoDataSuggestion('historical', null);
      expect(suggestion).toContain('available');
    });

    it('should provide climate normals message', () => {
      const suggestion = getNoDataSuggestion('climateNormals');
      expect(suggestion).toContain('10 years');
    });
  });

  describe('getAlternativeDateSuggestions', () => {
    it('should suggest dates for historical data', () => {
      const someDate = new Date('2025-06-15');
      const suggestions = getAlternativeDateSuggestions(someDate, 'historical');

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);

      const labels = suggestions.map((s) => s.label);
      expect(labels).toContain('One week ago');
      expect(labels).toContain('One month ago');
    });

    it('should suggest dates for forecast', () => {
      const someDate = new Date();
      const suggestions = getAlternativeDateSuggestions(someDate, 'forecast');

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);

      const labels = suggestions.map((s) => s.label);
      expect(labels).toContain('Tomorrow');
    });

    it('should only return dates within available range', () => {
      const someDate = new Date();
      const suggestions = getAlternativeDateSuggestions(someDate, 'forecast');

      suggestions.forEach((suggestion) => {
        expect(isDateAvailable(suggestion.date, 'forecast')).toBe(true);
      });
    });

    it('should suggest "same day last year" for historical if available', () => {
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 2); // 2 years ago

      const suggestions = getAlternativeDateSuggestions(recentDate, 'historical');
      const labels = suggestions.map((s) => s.label);

      // Last year from 2 years ago = 3 years ago, still within 5 year range
      expect(labels).toContain('Same day last year');
    });
  });
});
