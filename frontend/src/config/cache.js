/**
 * Cache TTL Configuration
 * Centralizes cache durations and allows overrides via Vite env vars.
 *
 * Environment overrides (milliseconds):
 * - VITE_CACHE_TTL_LOCATION_MS
 * - VITE_CACHE_TTL_RADAR_MS
 * - VITE_CACHE_TTL_AI_HISTORY_MS
 */

const DEFAULTS = {
  LOCATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  RADAR_MS: 5 * 60 * 1000, // 5 minutes
  AI_HISTORY_MS: 15 * 60 * 1000, // 15 minutes
};

const parseEnvMs = (key, fallback) => {
  const value = import.meta.env[key];
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const CACHE_TTL = {
  LOCATION_MS: parseEnvMs('VITE_CACHE_TTL_LOCATION_MS', DEFAULTS.LOCATION_MS),
  RADAR_MS: parseEnvMs('VITE_CACHE_TTL_RADAR_MS', DEFAULTS.RADAR_MS),
  AI_HISTORY_MS: parseEnvMs('VITE_CACHE_TTL_AI_HISTORY_MS', DEFAULTS.AI_HISTORY_MS),
};

export const CACHE_TTL_MINUTES = {
  LOCATION: Math.round(CACHE_TTL.LOCATION_MS / 60000),
  RADAR: Math.round(CACHE_TTL.RADAR_MS / 60000),
  AI_HISTORY: Math.round(CACHE_TTL.AI_HISTORY_MS / 60000),
};

export default CACHE_TTL;
