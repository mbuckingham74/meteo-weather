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

    // Mock localStorage
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    getItemSpy.mockReturnValue(null);

    // Mock API calls
    geocodeLocation.mockResolvedValue(mockSearchResults);
    getPopularLocations.mockResolvedValue(mockPopularLocations);

    // Clear all mocks
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders search input', () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      expect(screen.getByPlaceholderText(/search for a city/i)).toBeInTheDocument();
    });

    it('renders search icon', () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      expect(screen.getByText('📍')).toBeInTheDocument();
    });

    it('does not show clear button when query is empty', () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      expect(screen.queryByText('✕')).not.toBeInTheDocument();
    });

    it('shows clear button when query has value', () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      expect(screen.getByText('✕')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('updates query when typing', () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      expect(input).toHaveValue('Seattle');
    });

    it('clears query when clear button clicked', () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      const clearButton = screen.getByText('✕');
      fireEvent.click(clearButton);

      expect(input).toHaveValue('');
    });

    it('shows dropdown when input is focused', () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.focus(input);

      expect(input).toHaveValue('');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('searches locations after debounce delay', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      // Fast-forward debounce timer
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(geocodeLocation).toHaveBeenCalledWith('Seattle', 5);
      });
    });

    it('does not search for queries shorter than 2 characters', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'S' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(geocodeLocation).not.toHaveBeenCalled();
    });

    it('clears previous debounce timer when typing again', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);

      fireEvent.change(input, { target: { value: 'Sea' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      fireEvent.change(input, { target: { value: 'Seat' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      fireEvent.change(input, { target: { value: 'Seatt' } });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(geocodeLocation).toHaveBeenCalledTimes(1);
        expect(geocodeLocation).toHaveBeenCalledWith('Seatt', 5);
      });
    });

    it('shows loading indicator while searching', async () => {
      geocodeLocation.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSearchResults), 1000))
      );

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('⏳')).toBeInTheDocument();
      });
    });

    it('displays search results when available', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Seattle, WA, USA')).toBeInTheDocument();
      });
    });
  });

  describe('Location Selection', () => {
    it('calls onLocationSelect when location clicked', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Seattle, WA, USA')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Seattle, WA, USA'));

      expect(mockOnLocationSelect).toHaveBeenCalledWith(mockSearchResults[0]);
    });

    it('updates input value when location selected', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Seattle, WA, USA')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Seattle, WA, USA'));

      expect(input).toHaveValue('Seattle, WA, USA');
    });

    it('saves location to recent searches when selected', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Seattle, WA, USA')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Seattle, WA, USA'));

      expect(setItemSpy).toHaveBeenCalledWith(
        'meteo_recent_searches',
        JSON.stringify([mockSearchResults[0]])
      );
    });
  });

  describe('Recent Searches', () => {
    it('loads recent searches from localStorage on mount', () => {
      const savedSearches = [mockLocation];
      getItemSpy.mockReturnValue(JSON.stringify(savedSearches));

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.focus(input);

      expect(screen.getByText('🕐 Recent Searches')).toBeInTheDocument();
    });

    it('handles localStorage parse errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      getItemSpy.mockReturnValue('invalid json');

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading recent searches:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Popular Locations', () => {
    it('loads popular locations on mount', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      await waitFor(() => {
        expect(getPopularLocations).toHaveBeenCalled();
      });
    });

    it('shows popular locations when no recent searches', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      await waitFor(() => {
        expect(getPopularLocations).toHaveBeenCalled();
      });

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('🌟 Popular Locations')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('selects first result when Enter pressed', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'Seattle' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Seattle, WA, USA')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnLocationSelect).toHaveBeenCalledWith(mockSearchResults[0]);
    });

    it('closes dropdown when Escape pressed', async () => {
      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.queryByText('🌟 Popular Locations')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });

      expect(screen.queryByText('🌟 Popular Locations')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no results found', async () => {
      geocodeLocation.mockResolvedValue([]);

      render(<LocationSearchBar onLocationSelect={mockOnLocationSelect} />);

      const input = screen.getByPlaceholderText(/search for a city/i);
      fireEvent.change(input, { target: { value: 'XYZ' } });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('No locations found')).toBeInTheDocument();
      });
    });
  });
});
