/**
 * Meteo Weather - Service Worker
 * Provides offline support, caching strategies, and background sync
 *
 * Caching Strategies:
 * - Static assets (JS, CSS, images): Cache-first
 * - API calls: Network-first with offline fallback
 * - Weather data: Stale-while-revalidate (show cached, update in background)
 */

const CACHE_VERSION = 'meteo-v1.0.1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/offline.html',
];

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_API_CACHE_SIZE = 100;

// Cache duration (in milliseconds)
const API_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const WEATHER_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Install Event
 * Cache static assets on service worker installation
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', CACHE_VERSION);

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Don't fail if some assets are missing
        return cache
          .addAll(STATIC_ASSETS.filter((url) => url !== '/offline.html'))
          .catch((error) => {
            console.warn('[SW] Failed to cache some static assets:', error);
          });
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

/**
 * Activate Event
 * Clean up old caches on activation
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', CACHE_VERSION);

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old versions of our caches
              return (
                cacheName.startsWith('meteo-') &&
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE
              );
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event
 * Intercept network requests and apply caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests: Network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Weather API requests (external): Stale-while-revalidate
  if (
    url.hostname.includes('visualcrossing.com') ||
    url.hostname.includes('openweathermap.org') ||
    url.hostname.includes('api.openweathermap.org')
  ) {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  // Static assets: Cache-first
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Navigation requests: Network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, true));
    return;
  }

  // Default: Network-first
  event.respondWith(networkFirstStrategy(request));
});

/**
 * Cache-First Strategy
 * Check cache first, fallback to network if not found
 * Best for: Static assets that don't change often
 */
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache-first failed:', error);
    // Return offline fallback if available
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    throw error;
  }
}

/**
 * Network-First Strategy
 * Try network first, fallback to cache if offline
 * Best for: API calls and dynamic content
 */
async function networkFirstStrategy(request, isNavigation = false) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cacheName = request.url.includes('/api/') ? API_CACHE : DYNAMIC_CACHE;
      const cache = await caches.open(cacheName);

      // Add timestamp to cached response
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.append('sw-cached-at', Date.now().toString());

      const cachedResponse = new Response(await responseToCache.blob(), {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });

      cache.put(request, cachedResponse);

      // Limit cache size
      const maxSize = cacheName === API_CACHE ? MAX_API_CACHE_SIZE : MAX_DYNAMIC_CACHE_SIZE;
      limitCacheSize(cacheName, maxSize);
    }

    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network request failed, trying cache:', request.url);

    // Try cache as fallback
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Check if cache is too old for weather/API data
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      if (cachedAt) {
        const age = Date.now() - parseInt(cachedAt, 10);
        const maxAge = request.url.includes('/api/weather')
          ? WEATHER_CACHE_DURATION
          : API_CACHE_DURATION;

        if (age > maxAge) {
          console.warn('[SW] Cached response is stale:', request.url);
          // Still return it if we're offline, but log the warning
        }
      }

      return cachedResponse;
    }

    // If navigation request and no cache, show offline page
    if (isNavigation) {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    throw error;
  }
}

/**
 * Stale-While-Revalidate Strategy
 * Return cached response immediately, then update cache in background
 * Best for: Weather data that can be slightly stale
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch from network in parallel
  const networkResponsePromise = fetch(request)
    .then((response) => {
      // Update cache with new response
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.warn('[SW] Network update failed:', error);
      return null;
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // If no cache, wait for network
  return networkResponsePromise;
}

/**
 * Limit Cache Size
 * Delete oldest cached items when cache exceeds size limit
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    // Delete oldest items (FIFO)
    const deleteCount = keys.length - maxSize;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

/**
 * Background Sync Event
 * Handle background sync for favorite locations, weather updates, etc.
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-weather-data') {
    event.waitUntil(syncWeatherData());
  }
});

/**
 * Sync Weather Data
 * Update cached weather data in background
 */
async function syncWeatherData() {
  try {
    console.log('[SW] Syncing weather data in background...');

    // Get cached API requests
    const cache = await caches.open(API_CACHE);
    const keys = await cache.keys();

    // Update weather data for favorite locations
    const weatherRequests = keys.filter(
      (request) =>
        request.url.includes('/api/weather/current') ||
        request.url.includes('/api/weather/forecast')
    );

    await Promise.all(
      weatherRequests.map((request) =>
        fetch(request).then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
        })
      )
    );

    console.log('[SW] Weather data sync complete');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

/**
 * Message Event
 * Handle messages from the main app
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      })
    );
  }
});

console.log('[SW] Service worker script loaded');
