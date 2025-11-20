/**
 * TanStack Query (React Query) Configuration
 * Centralized configuration for data fetching, caching, and synchronization
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default query options for all queries
 */
const defaultQueryOptions = {
  queries: {
    // Stale time: how long data is considered fresh (5 minutes for weather data)
    staleTime: 5 * 60 * 1000, // 5 minutes

    // Cache time: how long inactive data stays in cache (30 minutes)
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime in v5)

    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for network errors
      return failureCount < 2;
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch on window focus (disabled by default to reduce API calls)
    refetchOnWindowFocus: false,

    // Refetch on reconnect
    refetchOnReconnect: 'always',

    // Note: placeholderData removed from global defaults to prevent showing
    // stale data when query keys change (e.g., switching locations).
    // Opt-in per query where appropriate using placeholderData: keepPreviousData
  },

  mutations: {
    // Retry mutations once on failure
    retry: 1,

    // Retry delay for mutations
    retryDelay: 1000,
  },
};

/**
 * Create and export QueryClient instance
 * Can be imported by tests for isolation
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

/**
 * Query key factory for consistent key generation
 * Prevents typos and makes refactoring easier
 *
 * IMPORTANT: Keys use stable primitives (strings, numbers) rather than objects
 * to prevent cache misses from referential inequality. Pass location IDs or
 * coordinate tuples, not full location objects.
 */
export const queryKeys = {
  // Weather-related queries
  weather: {
    all: ['weather'],
    // Use lat/lng tuple instead of location object for stable keys
    current: (lat, lng) => ['weather', 'current', lat, lng],
    forecast: (lat, lng) => ['weather', 'forecast', lat, lng],
    // Use ISO date strings instead of Date objects
    historical: (lat, lng, startDate, endDate) => [
      'weather',
      'historical',
      lat,
      lng,
      startDate,
      endDate,
    ],
  },

  // Location-related queries
  locations: {
    all: ['locations'],
    search: (query) => ['locations', 'search', query],
    reverse: (lat, lng) => ['locations', 'reverse', lat, lng],
    detail: (id) => ['locations', 'detail', id],
    saved: () => ['locations', 'saved'],
  },

  // AI-related queries
  ai: {
    all: ['ai'],
    // Use query string and stable weather identifiers, not full weatherData object
    analysis: (query, lat, lng) => ['ai', 'analysis', query, lat, lng],
    shared: (shareId) => ['ai', 'shared', shareId],
  },

  // User-related queries
  user: {
    all: ['user'],
    profile: () => ['user', 'profile'],
    preferences: () => ['user', 'preferences'],
    apiKeys: () => ['user', 'apiKeys'],
  },

  // Admin-related queries
  admin: {
    all: ['admin'],
    users: () => ['admin', 'users'],
    // Use ISO string instead of timeRange object
    analytics: (startDate, endDate) => ['admin', 'analytics', startDate, endDate],
  },
};

/**
 * Helper to invalidate multiple related queries at once
 * Example: invalidateWeatherQueries(queryClient, lat, lng)
 */
export const invalidateWeatherQueries = (client, lat, lng) => {
  return Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.weather.current(lat, lng) }),
    client.invalidateQueries({ queryKey: queryKeys.weather.forecast(lat, lng) }),
  ]);
};

export default queryClient;
