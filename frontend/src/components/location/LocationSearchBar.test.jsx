import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LocationSearchBar from './LocationSearchBar';
import { geocodeLocation, getPopularLocations } from '../../services/weatherApi';

// Mock weatherApi
vi.mock('../../services/weatherApi', () => ({
  geocodeLocation: vi.fn(),
  getPopularLocations: vi.fn(),
}));

describe('LocationSearchBar Component', () => {
  let mockOnLocationSelect;
  let mockLocation;
  let mockSearchResults;
  let mockPopularLocations;
  let getItemSpy;
  let setItemSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock functions
    mockOnLocationSelect = vi.fn();

    mockLocation = {
      address: 'Seattle, WA, USA',
      latitude: 47.6062,
      longitude: -122.3321,
      timezone: 'America/Los_Angeles',
    };

    mockSearchResults = [
      {
        address: 'Seattle, WA, USA',
        latitude: 47.6062,
        longitude: -122.3321,
        timezone: 'America/Los_Angeles',
      },
      {
        address: 'Portland, OR, USA',
        latitude: 45.5152,
        longitude: -122.6784,
        timezone: 'America/Los_Angeles',
      },
    ];

    mockPopularLocations = [
      {
        address: 'New York, NY, USA',
        latitude: 40.7128,
        longitude: -74.006,
      },
    ];

    // Clear localStorage before each test
    localStorage.clear();

    // Spy on localStorage methods directly
    getItemSpy = vi.spyOn(localStorage, 'getItem');
    setItemSpy = vi.spyOn(localStorage, 'setItem');

    // Mock API calls
    geocodeLocation.mockResolvedValue(mockSearchResults);
    getPopularLocations.mockResolvedValue(mockPopularLocations);

    // Use fake timers for debounce testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders search input', async () => {
      await act(async () => {
        render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);
      });

      expect(screen.getByPlaceholderText(/search for a city/i)).toBeInTheDocument();
    });

    it('renders search icon', async () => {
      await act(async () => {
        render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);
      });

      expect(screen.getByText('📍')).toBeInTheDocument();
    });

    it('does not show clear button when query is empty', async () => {
      await act(async () => {
        render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);
      });

      expect(screen.queryByText('✕')).not.toBeInTheDocument();
    });

    it('shows clear button when query has value', async () => {
      await act(async () => {
        render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);
      });

      const input = screen.getByPlaceholderText(/search for a city/i);

      act(() => {
        fireEvent.change(input, { target: { value: 'Seattle' } });
      });

      expect(screen.getByText('✕')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('updates query when typing', async () => {
      await act(async () => {
        render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);
      });

      const input = screen.getByPlaceholderText(/search for a city/i);

      act(() => {
        fireEvent.change(input, { target: { value: 'Seattle' } });
      });

      expect(input).toHaveValue('Seattle');
    });

    it('clears query when clear button clicked', async () => {
      await act(async () => {
        render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);
      });

      const input = screen.getByPlaceholderText(/search for a city/i);

      act(() => {
        fireEvent.change(input, { target: { value: 'Seattle' } });
      });

      const clearButton = screen.getByText('✕');

      act(() => {
        fireEvent.click(clearButton);
      });

      expect(input).toHaveValue('');
    });

    it('shows dropdown when input is focused', async () => {
      await act(async () => {
        render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);
      });

      const input = screen.getByPlaceholderText(/search for a city/i);

      act(() => {
        fireEvent.focus(input);
      });

      expect(input).toHaveValue('');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('searches locations after debounce delay', async () => {
      // Use real timers for this test since we need async promises to resolve
      vi.useRealTimers();

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);

      fireEvent.change(input, { target: { value: 'Seattle' } });

      // Wait for debounce (300ms) + async call
      await waitFor(
        () => {
          expect(geocodeLocation).toHaveBeenCalledWith('Seattle', 5);
        },
        { timeout: 1000 }
      );

      // Restore fake timers for other tests
      vi.useFakeTimers();
    });

    it('does not search for queries shorter than 2 characters', async () => {
      await act(async () => {
        render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);
      });

      const input = screen.getByPlaceholderText(/search for a city/i);
      await act(async () => {
        fireEvent.change(input, { target: { value: 'S' } });
        vi.advanceTimersByTime(300);
      });

      expect(geocodeLocation).not.toHaveBeenCalled();
    });

    it('clears previous debounce timer when typing again', async () => {
      vi.useRealTimers();

      await act(async () => {
        render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);
      });

      const input = screen.getByPlaceholderText(/search for a city/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: 'Sea' } });
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      await act(async () => {
        fireEvent.change(input, { target: { value: 'Seat' } });
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      await act(async () => {
        fireEvent.change(input, { target: { value: 'Seatt' } });
      });

      // Wait for debounce + async call
      await waitFor(
        () => {
          expect(geocodeLocation).toHaveBeenCalledTimes(1);
          expect(geocodeLocation).toHaveBeenCalledWith('Seatt', 5);
        },
        { timeout: 1000 }
      );

      vi.useFakeTimers();
    });

    it('shows loading indicator while searching', async () => {
      vi.useRealTimers();

      // Mock geocodeLocation to return a pending promise that we control
      let resolveSearch;
      geocodeLocation.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSearch = resolve;
          })
      );

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      // Wait for loading indicator to appear after debounce
      await waitFor(() => {
        expect(screen.getByText('⏳')).toBeInTheDocument();
      });

      // Clean up - resolve the promise
      await act(async () => {
        resolveSearch(mockSearchResults);
      });

      vi.useFakeTimers();
    });

    it('displays search results when available', async () => {
      vi.useRealTimers();

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      // Wait for the results to be displayed
      await waitFor(
        () => {
          expect(screen.getByText('Seattle, WA, USA')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      vi.useFakeTimers();
    });
  });

  describe('Location Selection', () => {
    it('calls onLocationSelect when location clicked', async () => {
      vi.useRealTimers();

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      // Wait for results to render
      await waitFor(
        () => {
          expect(screen.getByText('Seattle, WA, USA')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      fireEvent.click(screen.getByText('Seattle, WA, USA'));

      expect(mockOnLocationSelect).toHaveBeenCalledWith(mockSearchResults[0]);

      vi.useFakeTimers();
    });

    it('updates input value when location selected', async () => {
      vi.useRealTimers();

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      // Wait for results to render
      await waitFor(
        () => {
          expect(screen.getByText('Seattle, WA, USA')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      fireEvent.click(screen.getByText('Seattle, WA, USA'));

      expect(input).toHaveValue('Seattle, WA, USA');

      vi.useFakeTimers();
    });

    it('saves location to recent searches when selected', async () => {
      vi.useRealTimers();

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      // Wait for results to render
      await waitFor(
        () => {
          expect(screen.getByText('Seattle, WA, USA')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      fireEvent.click(screen.getByText('Seattle, WA, USA'));

      expect(setItemSpy).toHaveBeenCalledWith(
        'meteo_recent_searches',
        JSON.stringify([mockSearchResults[0]])
      );

      vi.useFakeTimers();
    });
  });

  describe('Recent Searches', () => {
    it('loads recent searches from localStorage on mount', async () => {
      vi.useRealTimers();

      const savedSearches = [mockLocation];
      getItemSpy.mockReturnValue(JSON.stringify(savedSearches));

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.focus(input);

      // Wait for dropdown to render with recent searches (async effect)
      await waitFor(() => {
        expect(screen.getByText('🕐 Recent Searches')).toBeInTheDocument();
      });

      vi.useFakeTimers();
    });

    it('handles localStorage parse errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      getItemSpy.mockReturnValue('invalid json');

      // Wrap in act to handle the useEffect that runs on mount
      await act(async () => {
        render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading recent searches:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Popular Locations', () => {
    it('loads popular locations on mount', async () => {
      vi.useRealTimers();

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      // Wait for the async useEffect to call getPopularLocations
      await waitFor(
        () => {
          expect(getPopularLocations).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      vi.useFakeTimers();
    });

    it('shows popular locations when no recent searches', async () => {
      vi.useRealTimers();

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      // Wait for popular locations to load
      await waitFor(
        () => {
          expect(getPopularLocations).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.focus(input);

      // Wait for dropdown to show popular locations
      await waitFor(
        () => {
          expect(screen.getByText('🌟 Popular Locations')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      vi.useFakeTimers();
    });
  });

  describe('Keyboard Navigation', () => {
    it('selects first result when Enter pressed', async () => {
      vi.useRealTimers();

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      // Wait for results to render
      await waitFor(
        () => {
          expect(screen.getByText('Seattle, WA, USA')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnLocationSelect).toHaveBeenCalledWith(mockSearchResults[0]);

      vi.useFakeTimers();
    });

    it('closes dropdown when Escape pressed', async () => {
      vi.useRealTimers();

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.focus(input);

      // Wait for popular locations to render in dropdown
      await waitFor(
        () => {
          expect(screen.queryByText('🌟 Popular Locations')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      fireEvent.keyDown(input, { key: 'Escape' });

      // Wait for dropdown to close
      await waitFor(() => {
        expect(screen.queryByText('🌟 Popular Locations')).not.toBeInTheDocument();
      });

      vi.useFakeTimers();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no results found', async () => {
      vi.useRealTimers();

      geocodeLocation.mockResolvedValue([]);

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'XYZ' } });

      // Wait for empty state to render
      await waitFor(
        () => {
          expect(screen.getByText('No locations found')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      vi.useFakeTimers();
    });
  });
});
