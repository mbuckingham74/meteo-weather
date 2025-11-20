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

    // Keep previous data while fetching new data (smooth UX)
    placeholderData: (previousData) => previousData,
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
 */
export const queryKeys = {
  // Weather-related queries
  weather: {
    all: ['weather'],
    current: (location) => ['weather', 'current', location],
    forecast: (location) => ['weather', 'forecast', location],
    historical: (location, dateRange) => ['weather', 'historical', location, dateRange],
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
    analysis: (query, weatherData) => ['ai', 'analysis', query, weatherData],
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
    analytics: (timeRange) => ['admin', 'analytics', timeRange],
  },
};

/**
 * Helper to invalidate multiple related queries at once
 * Example: invalidateWeatherQueries(queryClient, location)
 */
export const invalidateWeatherQueries = (client, location) => {
  return Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.weather.current(location) }),
    client.invalidateQueries({ queryKey: queryKeys.weather.forecast(location) }),
  ]);
};

export default queryClient;
