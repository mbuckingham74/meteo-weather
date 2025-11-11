/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAIHistory,
  addToAIHistory,
  getHistoryItem,
  deleteHistoryItem,
  clearAIHistory,
  formatHistoryTimestamp,
} from './aiHistoryStorage';

describe('aiHistoryStorage', () => {
  // Mock localStorage
  let localStorageMock;

  beforeEach(() => {
    // Create a fresh localStorage mock for each test
    localStorageMock = {
      store: {},
      getItem: vi.fn((key) => localStorageMock.store[key] || null),
      setItem: vi.fn((key, value) => {
        localStorageMock.store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete localStorageMock.store[key];
      }),
      clear: vi.fn(() => {
        localStorageMock.store = {};
      }),
    };

    // Replace global localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Clear console.error spy
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    console.error.mockRestore();
  });

  describe('getAIHistory', () => {
    it('returns empty array when localStorage is empty', () => {
      expect(getAIHistory()).toEqual([]);
    });

    it('returns parsed history from localStorage', () => {
      const mockHistory = [
        { id: '1', question: 'Will it rain?', timestamp: new Date().toISOString() },
      ];
      localStorageMock.store['meteo_ai_history'] = JSON.stringify(mockHistory);

      expect(getAIHistory()).toEqual(mockHistory);
    });

    it('returns empty array if localStorage contains invalid JSON', () => {
      localStorageMock.store['meteo_ai_history'] = 'invalid json';

      expect(getAIHistory()).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('returns empty array if localStorage contains non-array', () => {
      localStorageMock.store['meteo_ai_history'] = JSON.stringify({ not: 'array' });

      expect(getAIHistory()).toEqual([]);
    });

    it('handles localStorage throwing error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      expect(getAIHistory()).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addToAIHistory', () => {
    it('adds new item to empty history', () => {
      const item = {
        question: 'Will it rain today?',
        answer: 'Yes, expect rain in the afternoon.',
        location: 'Seattle, WA',
        confidence: 'high',
        tokensUsed: 150,
      };

      addToAIHistory(item);

      const history = getAIHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        question: item.question,
        answer: item.answer,
        location: item.location,
        confidence: item.confidence,
        tokensUsed: item.tokensUsed,
      });
      expect(history[0].id).toBeTruthy();
      expect(history[0].timestamp).toBeTruthy();
    });

    it('adds item to beginning of existing history', () => {
      const item1 = { question: 'Question 1', answer: 'Answer 1', location: 'Seattle' };
      const item2 = { question: 'Question 2', answer: 'Answer 2', location: 'Portland' };

      addToAIHistory(item1);
      addToAIHistory(item2);

      const history = getAIHistory();
      expect(history).toHaveLength(2);
      expect(history[0].question).toBe('Question 2'); // Most recent first
      expect(history[1].question).toBe('Question 1');
    });

    it('limits history to MAX_HISTORY_ITEMS (10)', () => {
      // Add 15 items
      for (let i = 0; i < 15; i++) {
        addToAIHistory({
          question: `Question ${i}`,
          answer: `Answer ${i}`,
          location: 'Seattle',
        });
      }

      const history = getAIHistory();
      expect(history).toHaveLength(10);
      expect(history[0].question).toBe('Question 14'); // Most recent
      expect(history[9].question).toBe('Question 5'); // Oldest kept
    });

    it('removes duplicates within one hour', () => {
      const item = {
        question: 'Will it rain?',
        answer: 'Yes',
        location: 'Seattle, WA',
      };

      addToAIHistory(item);
      addToAIHistory(item); // Duplicate

      const history = getAIHistory();
      expect(history).toHaveLength(1); // Only one entry
    });

    it('allows duplicates if different location', () => {
      const item1 = { question: 'Will it rain?', answer: 'Yes', location: 'Seattle' };
      const item2 = { question: 'Will it rain?', answer: 'No', location: 'Portland' };

      addToAIHistory(item1);
      addToAIHistory(item2);

      const history = getAIHistory();
      expect(history).toHaveLength(2);
    });

    it('stores visualizations summary', () => {
      const item = {
        question: 'Show me rain data',
        answer: 'Here is the data',
        location: 'Seattle',
        visualizations: [
          { type: 'radar', reason: 'User asked about rain', fullData: { large: 'object' } },
          { type: 'chart', reason: 'Historical data', fullData: { large: 'object' } },
        ],
      };

      addToAIHistory(item);

      const history = getAIHistory();
      expect(history[0].visualizations).toHaveLength(2);
      expect(history[0].visualizations[0]).toEqual({
        type: 'radar',
        reason: 'User asked about rain',
      });
      expect(history[0].visualizations[0].fullData).toBeUndefined(); // Lightweight storage
    });

    it('stores follow-up questions', () => {
      const item = {
        question: 'Will it rain?',
        answer: 'Yes',
        location: 'Seattle',
        followUpQuestions: ['When will it stop?', 'How much rain?'],
      };

      addToAIHistory(item);

      const history = getAIHistory();
      expect(history[0].followUpQuestions).toEqual(['When will it stop?', 'How much rain?']);
    });

    it('handles missing optional fields', () => {
      const item = {
        question: 'Simple question',
        answer: 'Simple answer',
        location: 'Seattle',
      };

      addToAIHistory(item);

      const history = getAIHistory();
      expect(history[0].visualizations).toEqual([]);
      expect(history[0].followUpQuestions).toEqual([]);
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const item = { question: 'Test', answer: 'Test', location: 'Seattle' };

      expect(() => addToAIHistory(item)).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getHistoryItem', () => {
    it('returns item by ID', () => {
      const item = { question: 'Test', answer: 'Test', location: 'Seattle' };
      addToAIHistory(item);

      const history = getAIHistory();
      const id = history[0].id;

      const retrieved = getHistoryItem(id);
      expect(retrieved).toMatchObject(item);
    });

    it('returns null for non-existent ID', () => {
      expect(getHistoryItem('nonexistent')).toBeNull();
    });

    it('returns null for empty history', () => {
      expect(getHistoryItem('123')).toBeNull();
    });
  });

  describe('deleteHistoryItem', () => {
    it('deletes item by ID', () => {
      // Manually create two items with unique IDs
      const history = [
        {
          id: '1',
          question: 'Q1',
          answer: 'A1',
          location: 'Seattle',
          timestamp: new Date().toISOString(),
          visualizations: [],
          followUpQuestions: [],
        },
        {
          id: '2',
          question: 'Q2',
          answer: 'A2',
          location: 'Portland',
          timestamp: new Date().toISOString(),
          visualizations: [],
          followUpQuestions: [],
        },
      ];
      localStorageMock.store['meteo_ai_history'] = JSON.stringify(history);

      // Delete the first item
      deleteHistoryItem('1');

      const updatedHistory = getAIHistory();
      expect(updatedHistory).toHaveLength(1);
      expect(updatedHistory[0].question).toBe('Q2');
    });

    it('handles non-existent ID gracefully', () => {
      addToAIHistory({ question: 'Test', answer: 'Test', location: 'Seattle' });

      expect(() => deleteHistoryItem('nonexistent')).not.toThrow();

      const history = getAIHistory();
      expect(history).toHaveLength(1); // Original item still there
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => deleteHistoryItem('123')).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clearAIHistory', () => {
    it('removes all history from localStorage', () => {
      addToAIHistory({ question: 'Q1', answer: 'A1', location: 'Seattle' });
      addToAIHistory({ question: 'Q2', answer: 'A2', location: 'Portland' });

      expect(getAIHistory()).toHaveLength(2);

      clearAIHistory();

      expect(getAIHistory()).toHaveLength(0);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('meteo_ai_history');
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearAIHistory()).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('works on empty history', () => {
      expect(() => clearAIHistory()).not.toThrow();
    });
  });

  describe('formatHistoryTimestamp', () => {
    it('returns "Just now" for timestamps less than 1 minute ago', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 30 * 1000).toISOString(); // 30 seconds ago

      expect(formatHistoryTimestamp(timestamp)).toBe('Just now');
    });

    it('returns minutes ago for timestamps less than 1 hour', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 5 * 60 * 1000).toISOString(); // 5 minutes ago

      expect(formatHistoryTimestamp(timestamp)).toBe('5m ago');
    });

    it('returns hours ago for timestamps less than 24 hours', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(); // 3 hours ago

      expect(formatHistoryTimestamp(timestamp)).toBe('3h ago');
    });

    it('returns "Yesterday" for timestamps 1 day ago', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago

      expect(formatHistoryTimestamp(timestamp)).toBe('Yesterday');
    });

    it('returns days ago for timestamps less than 7 days', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago

      expect(formatHistoryTimestamp(timestamp)).toBe('3d ago');
    });

    it('returns formatted date for timestamps older than 7 days', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days ago

      const result = formatHistoryTimestamp(timestamp);
      // Should be in format like "Oct 25" or "Nov 2"
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
    });

    it('handles very old timestamps', () => {
      const oldDate = new Date('2020-01-01T12:00:00Z').toISOString();
      const result = formatHistoryTimestamp(oldDate);

      // Should be in format like "Jan 1" or "Dec 31" depending on timezone
      expect(result).toMatch(/^(Jan 1|Dec 31)$/);
    });
  });

  describe('duplicate detection edge cases', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('allows duplicate after one hour', () => {
      // Use real timers for this test instead of fake timers
      vi.useRealTimers();

      const item = { question: 'Will it rain?', answer: 'Yes', location: 'Seattle' };

      // Add first item with old timestamp
      const oldTimestamp = new Date(Date.now() - 65 * 60 * 1000).toISOString(); // 65 minutes ago
      const oldItem = { ...item, timestamp: oldTimestamp };

      // Manually add to localStorage with old timestamp
      localStorageMock.store['meteo_ai_history'] = JSON.stringify([
        {
          ...oldItem,
          id: '1',
          visualizations: [],
          followUpQuestions: [],
        },
      ]);

      // Add new item (should not be filtered as duplicate)
      addToAIHistory(item);

      const history = getAIHistory();
      expect(history).toHaveLength(2); // Both entries kept

      vi.useFakeTimers(); // Restore fake timers for afterEach
    });
  });
});
