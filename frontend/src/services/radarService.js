/**
 * Radar Service
 * Fetches historical radar data from RainViewer API
 *
 * RainViewer provides:
 * - Past 2 hours of radar data (10-minute intervals)
 * - 30 minutes of forecast data
 * - Free tier with 1000 requests/IP/minute limit
 * - Zoom level limited to 10 for free users
 */

import CACHE_TTL from '../config/cache';

const RAINVIEWER_API_URL = 'https://api.rainviewer.com/public/weather-maps.json';
const RADAR_CACHE_DURATION = CACHE_TTL.RADAR_MS; // Environment-aware cache duration

// In-memory cache
let cachedData = null;
let cacheTimestamp = null;

/**
 * Fetch radar map data from RainViewer
 * Returns past 2 hours and future 30 minutes of radar data
 *
 * @returns {Promise<Object>} Radar data with past/forecast frames
 */
export async function getRadarMapData() {
  // Return cached data if still fresh
  if (cachedData && cacheTimestamp && Date.now() - cacheTimestamp < RADAR_CACHE_DURATION) {
    console.log('✅ Using cached radar data');
    return cachedData;
  }

  try {
    console.log('🌐 Fetching fresh radar data from RainViewer...');
    const response = await fetch(RAINVIEWER_API_URL);

    if (!response.ok) {
      throw new Error(`RainViewer API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    cachedData = data;
    cacheTimestamp = Date.now();

    console.log(
      `✅ Fetched radar data: ${data.radar.past.length} past frames, ${data.radar.nowcast.length} forecast frames`
    );

    return data;
  } catch (error) {
    console.error('❌ Error fetching radar data:', error);

    // Return cached data if available, even if stale
    if (cachedData) {
      console.warn('⚠️ Using stale cached radar data due to API error');
      return cachedData;
    }

    throw error;
  }
}

/**
 * Build tile URL for a specific radar frame
 *
 * @param {string} host - Base host URL
 * @param {string} path - Frame path (timestamp)
 * @param {number} size - Tile size (256 or 512)
 * @param {number} colorScheme - Color scheme (0-8)
 * @param {boolean} smooth - Enable smooth rendering
 * @param {boolean} snow - Enable snow detection
 * @returns {string} Tile URL template
 */
export function buildRadarTileUrl(
  host,
  path,
  size = 256,
  colorScheme = 2,
  smooth = true,
  snow = false
) {
  const options = `${smooth ? '1' : '0'}_${snow ? '1' : '0'}`;

  // Return URL template - Leaflet will replace {z}/{x}/{y}
  return `${host}${path}/${size}/{z}/{x}/{y}/${colorScheme}/${options}.png`;
}

/**
 * Get past radar frames with timestamps
 *
 * @param {Object} radarData - Full radar data from API
 * @returns {Array<Object>} Array of frame objects with time and URL template
 */
export function getPastFrames(radarData) {
  if (!radarData?.radar?.past) {
    return [];
  }

  return radarData.radar.past.map((frame) => ({
    time: frame.time, // Unix timestamp
    path: frame.path,
    url: buildRadarTileUrl(radarData.host, frame.path),
  }));
}

/**
 * Get forecast radar frames with timestamps
 *
 * @param {Object} radarData - Full radar data from API
 * @returns {Array<Object>} Array of frame objects with time and URL template
 */
export function getForecastFrames(radarData) {
  if (!radarData?.radar?.nowcast) {
    return [];
  }

  return radarData.radar.nowcast.map((frame) => ({
    time: frame.time, // Unix timestamp
    path: frame.path,
    url: buildRadarTileUrl(radarData.host, frame.path),
  }));
}

/**
 * Get all frames (past + forecast) for continuous animation
 *
 * @param {Object} radarData - Full radar data from API
 * @returns {Array<Object>} Combined array of all frames
 */
export function getAllFrames(radarData) {
  const past = getPastFrames(radarData);
  const forecast = getForecastFrames(radarData);

  return [...past, ...forecast];
}

/**
 * Format Unix timestamp to readable time
 *
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @returns {string} Formatted time string
 */
export function formatRadarTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get relative time description (e.g., "5 minutes ago")
 *
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @returns {string} Relative time string
 */
export function getRelativeTime(unixTimestamp) {
  const now = Date.now() / 1000;
  const diff = now - unixTimestamp;

  if (diff < 60) {
    return 'Just now';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} min ago`;
  } else {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  }
}

/**
 * Clear cached radar data (useful for manual refresh)
 */
export function clearRadarCache() {
  cachedData = null;
  cacheTimestamp = null;
  console.log('🗑️ Radar cache cleared');
}
