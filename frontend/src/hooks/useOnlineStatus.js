import { useState, useEffect } from 'react';
import { debugInfo, debugWarn } from '../utils/debugLogger';

/**
 * Custom Hook: useOnlineStatus
 *
 * Detects and tracks network connectivity status.
 * Part of Error Message Improvement Initiative (Phase 4).
 *
 * Features:
 * - Real-time online/offline detection
 * - Network quality estimation (slow connection detection)
 * - Automatic reconnection detection
 * - Optional callback on status change
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onOnline - Callback when connection restored
 * @param {Function} options.onOffline - Callback when connection lost
 * @param {boolean} options.checkQuality - Whether to check connection quality
 * @param {number} options.qualityThreshold - Response time threshold for slow connection (ms)
 * @returns {Object} Online status information
 *
 * @example
 * const { isOnline, isSlowConnection, lastChecked } = useOnlineStatus({
 *   onOffline: () => console.log('Connection lost'),
 *   onOnline: () => console.log('Connection restored'),
 *   checkQuality: true
 * });
 *
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 */
export function useOnlineStatus(options = {}) {
  const {
    onOnline = null,
    onOffline = null,
    checkQuality = false,
    qualityThreshold = 3000, // 3 seconds
  } = options;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [wasOffline, setWasOffline] = useState(!navigator.onLine);

  useEffect(() => {
    debugInfo('Network Monitor', `Initial status: ${navigator.onLine ? 'online' : 'offline'}`);

    /**
     * Handle online event
     */
    const handleOnline = () => {
      debugInfo('Network Monitor', 'Connection restored');
      setIsOnline(true);
      setLastChecked(new Date());

      // Trigger callback if we were previously offline
      if (wasOffline && onOnline) {
        onOnline();
      }
      setWasOffline(false);
    };

    /**
     * Handle offline event
     */
    const handleOffline = () => {
      debugWarn('Network Monitor', 'Connection lost');
      setIsOnline(false);
      setIsSlowConnection(false);
      setLastChecked(new Date());
      setWasOffline(true);

      if (onOffline) {
        onOffline();
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Optional: Check connection quality
    let qualityCheckInterval;
    if (checkQuality && navigator.onLine) {
      qualityCheckInterval = setInterval(async () => {
        await checkConnectionQuality(qualityThreshold, setIsSlowConnection);
        setLastChecked(new Date());
      }, 30000); // Check every 30 seconds
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (qualityCheckInterval) {
        clearInterval(qualityCheckInterval);
      }
    };
  }, [onOnline, onOffline, checkQuality, qualityThreshold, wasOffline]);

  return {
    isOnline,
    isSlowConnection,
    lastChecked,
    connectionQuality: getConnectionQuality(isOnline, isSlowConnection),
  };
}

/**
 * Check connection quality by making a lightweight request
 * @param {number} threshold - Response time threshold in ms
 * @param {Function} setIsSlowConnection - State setter for slow connection
 */
async function checkConnectionQuality(threshold, setIsSlowConnection) {
  if (!navigator.onLine) {
    setIsSlowConnection(false);
    return;
  }

  try {
    const startTime = Date.now();

    // Ping a lightweight resource (using current domain)
    // Note: We use a cache-busting query param to get real network timing
    await fetch(`${window.location.origin}/favicon.ico?t=${startTime}`, {
      method: 'HEAD',
      cache: 'no-cache',
    });

    const responseTime = Date.now() - startTime;
    const isSlow = responseTime > threshold;

    setIsSlowConnection(isSlow);

    if (isSlow) {
      debugWarn('Network Monitor', `Slow connection detected: ${responseTime}ms`);
    } else {
      debugInfo('Network Monitor', `Connection quality good: ${responseTime}ms`);
    }
  } catch (error) {
    // If the check fails, assume connection issues but don't mark as offline
    // (the browser's online event is more reliable for offline detection)
    debugWarn('Network Monitor', 'Connection quality check failed', error);
    setIsSlowConnection(true);
  }
}

/**
 * Get human-readable connection quality
 * @param {boolean} isOnline
 * @param {boolean} isSlowConnection
 * @returns {string} Connection quality status
 */
function getConnectionQuality(isOnline, isSlowConnection) {
  if (!isOnline) return 'offline';
  if (isSlowConnection) return 'slow';
  return 'good';
}

/**
 * Simple hook for just online/offline status
 * Lightweight version without quality checking
 *
 * @example
 * const isOnline = useIsOnline();
 */
export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Utility function to check online status synchronously
 * @returns {boolean} Current online status
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Utility function to check if we can reach the API
 * More reliable than navigator.onLine for actual connectivity
 *
 * @param {string} apiUrl - API URL to check
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<boolean>} Whether API is reachable
 *
 * @example
 * const canReachAPI = await checkAPIConnectivity('/api/health');
 */
export async function checkAPIConnectivity(
  apiUrl = `${import.meta.env.VITE_API_URL}/health`,
  timeout = 5000
) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(apiUrl, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);

    return response.ok;
  } catch (error) {
    debugWarn('Network Monitor', 'API connectivity check failed', error);
    return false;
  }
}

export default {
  useOnlineStatus,
  useIsOnline,
  isOnline,
  checkAPIConnectivity,
};
