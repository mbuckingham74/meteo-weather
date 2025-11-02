import { reverseGeocode } from './weatherApi';

/**
 * Geolocation Service
 * Detects user's current location using browser Geolocation API
 * Falls back to IP geolocation if browser geolocation fails
 */

/**
 * Get location from IP address using multiple fallback services
 * @returns {Promise<Object>} Location object with address, latitude, longitude
 */
async function getLocationFromIP() {
  console.log('🌐 Attempting IP-based geolocation...');

  // Try multiple IP geolocation services in order
  const services = [
    {
      name: 'ipapi.co',
      url: 'https://ipapi.co/json/',
      parser: (data) => {
        const hasValidCity = data.city && data.city !== 'Unknown' && data.city.trim() !== '';
        const address = hasValidCity
          ? `${data.city}, ${data.region_code || data.region}, ${data.country_name}`
          : 'Your Location';

        return {
          address,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          accuracy: 5000,
          method: 'ip',
          requiresConfirmation: true, // IP-based locations should be confirmed
          detectionMethod: 'IP Geolocation (ipapi.co)'
        };
      }
    },
    {
      name: 'geojs.io',
      url: 'https://get.geojs.io/v1/ip/geo.json',
      parser: (data) => {
        // Use city name if available, otherwise fall back to "Your Location"
        const hasValidCity = data.city && data.city !== 'Unknown' && data.city.trim() !== '';
        const address = hasValidCity
          ? `${data.city}, ${data.region}, ${data.country}`
          : 'Your Location';

        return {
          address,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          timezone: data.timezone,
          accuracy: 5000,
          method: 'ip',
          requiresConfirmation: true, // IP-based locations should be confirmed
          detectionMethod: 'IP Geolocation (geojs.io)'
        };
      }
    }
  ];

  // Try each service until one succeeds
  for (const service of services) {
    try {
      console.log(`   Trying ${service.name}...`);

      const response = await fetch(service.url);

      if (!response.ok) {
        console.warn(`   ${service.name} returned ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.error || data.status === 'fail') {
        console.warn(`   ${service.name} error:`, data.message || data.reason);
        continue;
      }

      const location = service.parser(data);
      console.log(`✅ IP geolocation successful via ${service.name}:`, location);
      return location;
    } catch (error) {
      console.warn(`   ${service.name} failed:`, error.message);
      continue;
    }
  }

  // All services failed
  throw new Error('All IP geolocation services failed');
}

/**
 * Get user's current location
 * @returns {Promise<Object>} Location object with address, latitude, longitude
 */
export async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    console.log('🌍 Attempting to get user location...');
    console.log('   Browser:', navigator.userAgent.split(' ').slice(-2).join(' '));
    console.log('   Protocol:', window.location.protocol);
    console.log('   Is secure context:', window.isSecureContext);

    // Try with balanced settings (works on most devices)
    const defaultOptions = {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 0 // Don't use cached position to avoid stale data issues
    };

    // Fallback to high accuracy with longer timeout if first attempt fails
    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0
    };

    const attemptGeolocation = (options, isRetry = false) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          console.log(`📍 Got coordinates (${options.enableHighAccuracy ? 'high' : 'low'} accuracy):`, latitude, longitude, `±${position.coords.accuracy}m`);

          try {
            // Try to reverse geocode to get address
            const location = await reverseGeocode(latitude, longitude);

            console.log('✅ Reverse geocoding successful:', location);

            // Check if the address is actually just coordinates (happens when backend is rate limited)
            // Pattern: "12.3456, -78.9012" or similar
            const isCoordinatesOnly = /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(location.address);

            if (isCoordinatesOnly) {
              console.warn('⚠️ Reverse geocoding returned coordinates as address, using friendly fallback');
              resolve({
                ...location,
                address: 'Your Location', // User-friendly display instead of coordinates
                accuracy: position.coords.accuracy,
                method: options.enableHighAccuracy ? 'gps' : 'browser',
                requiresConfirmation: position.coords.accuracy > 1000, // Confirm if accuracy is poor
                detectionMethod: options.enableHighAccuracy ? 'GPS (High Accuracy)' : 'Browser Geolocation'
              });
            } else {
              resolve({
                ...location,
                accuracy: position.coords.accuracy,
                method: options.enableHighAccuracy ? 'gps' : 'browser',
                requiresConfirmation: position.coords.accuracy > 1000, // Confirm if accuracy is poor
                detectionMethod: options.enableHighAccuracy ? 'GPS (High Accuracy)' : 'Browser Geolocation'
              });
            }
          } catch (error) {
            console.warn('⚠️ Reverse geocoding failed, using coordinates only:', error.message);

            // If reverse geocoding fails (e.g., API rate limit), return user-friendly fallback
            // The weather API can still work with lat,lon coordinates
            const fallbackLocation = {
              address: 'Your Location', // User-friendly display instead of raw coordinates
              latitude: latitude,
              longitude: longitude,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              accuracy: position.coords.accuracy,
              method: options.enableHighAccuracy ? 'gps' : 'browser',
              requiresConfirmation: position.coords.accuracy > 1000, // Confirm if accuracy is poor
              detectionMethod: options.enableHighAccuracy ? 'GPS (High Accuracy)' : 'Browser Geolocation'
            };

            console.log('📍 Using fallback location:', fallbackLocation);
            resolve(fallbackLocation);
          }
        },
        (error) => {
          console.error(`❌ Geolocation error (${options.enableHighAccuracy ? 'high' : 'low'} accuracy):`);
          console.error('   Error code:', error.code);
          console.error('   Error message:', error.message);
          console.error('   Full error:', error);

          // Error codes: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
          const errorCodes = {
            1: 'PERMISSION_DENIED',
            2: 'POSITION_UNAVAILABLE',
            3: 'TIMEOUT'
          };
          console.error('   Error type:', errorCodes[error.code] || 'UNKNOWN');

          // If low accuracy failed and we haven't tried high accuracy yet, try that
          if (!isRetry && !options.enableHighAccuracy) {
            console.log('🔄 Retrying with high accuracy (GPS)...');
            attemptGeolocation(highAccuracyOptions, true);
            return;
          }

          // Both browser geolocation attempts failed
          // Try IP-based geolocation as a last resort
          console.log('💡 Browser geolocation failed, trying IP-based location...');

          getLocationFromIP()
            .then(location => {
              console.log('✅ Successfully got location via IP fallback');
              resolve(location);
            })
            .catch(ipError => {
              // All methods failed - return final error
              console.error('❌ IP geolocation also failed:', ipError.message);

              let errorMessage = 'Unable to retrieve your location';

              switch (error.code) {
                case 1: // PERMISSION_DENIED
                  errorMessage = 'Location permission denied. Please allow location access in your browser settings.';
                  break;
                case 2: // POSITION_UNAVAILABLE
                  errorMessage = 'Location unavailable. Please check System Settings → Privacy & Security → Location Services, ensure it\'s enabled and your browser has access. Or try entering a city name.';
                  break;
                case 3: // TIMEOUT
                  errorMessage = 'Location request timed out. Please try again or enter a city name.';
                  break;
                default:
                  errorMessage = 'Location detection failed. Please try entering a city name.';
              }

              console.error('   Final error message:', errorMessage);
              reject(new Error(errorMessage));
            });
        },
        options
      );
    };

    // Start with default settings (balanced speed and compatibility)
    console.log('📡 Starting geolocation with default settings...');
    attemptGeolocation(defaultOptions);
  });
}

/**
 * Check if geolocation is supported
 * @returns {boolean} True if geolocation is supported
 */
export function isGeolocationSupported() {
  return 'geolocation' in navigator;
}

/**
 * Request location permission (doesn't actually trigger permission, but checks support)
 * @returns {Promise<boolean>} True if permission can be requested
 */
export async function canRequestLocation() {
  if (!navigator.permissions) {
    return isGeolocationSupported();
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state !== 'denied';
  } catch (error) {
    return isGeolocationSupported();
  }
}
