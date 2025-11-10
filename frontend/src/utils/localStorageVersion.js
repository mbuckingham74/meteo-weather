/**
 * localStorage Versioning System
 *
 * Handles data migration between localStorage schema versions
 * Prevents bugs caused by old cached data with incompatible formats
 *
 * Version History:
 * - v1 (Pre-Nov 6, 2025): No version field, may contain "Your Location" string
 * - v2 (Nov 6, 2025): Added version field, sanitizes placeholders, ensures coordinates
 *
 * See: docs/troubleshooting/REGRESSION_PREVENTION.md
 */

export const STORAGE_VERSION = 2;
export const VERSION_KEY = 'meteo_storage_version';

/**
 * Check if an address is a placeholder value that should be replaced
 * @param {string} address - Address to check
 * @returns {boolean} - True if address is a placeholder
 */
function isPlaceholderAddress(address) {
  if (!address || typeof address !== 'string') return true;

  const trimmed = address.trim();
  if (trimmed === '') return true;

  // Check for known placeholder values from API or cached UI strings
  // CRITICAL: "Your Location" can be cached in old localStorage data
  if (/^(old location|your location|location|unknown|coordinates?|unnamed)$/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Migrate v1 data (no version) to v2 format
 * @param {Object} data - Old data without version
 * @returns {Object} - Migrated data with version 2 format
 */
function migrateV1ToV2(data) {
  console.log('📦 Migrating localStorage from v1 to v2...');

  if (!data) return null;

  const address = data.address || data.location_name;
  const hasCoords = data.latitude != null && data.longitude != null;

  // If address is a placeholder, replace with coordinates
  if (isPlaceholderAddress(address)) {
    if (hasCoords) {
      console.log(`🔄 Replaced placeholder "${address}" with coordinates`);
      return {
        version: 2,
        address: `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
        latitude: data.latitude,
        longitude: data.longitude,
        location_name: data.location_name,
        timezone: data.timezone,
      };
    } else {
      console.warn('⚠️  v1 data has placeholder address but no coordinates - discarding');
      return null;
    }
  }

  // Address is valid, just add version
  return {
    version: 2,
    ...data,
  };
}

/**
 * Get current storage version from localStorage
 * @returns {number} - Version number (0 if not set)
 */
export function getStorageVersion() {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (!version) return 0;

    const parsed = parseInt(version, 10);
    // Return 0 if parseInt returns NaN (invalid version string)
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Error reading storage version:', error);
    return 0;
  }
}

/**
 * Set storage version in localStorage
 * @param {number} version - Version number to set
 */
export function setStorageVersion(version) {
  try {
    localStorage.setItem(VERSION_KEY, version.toString());
    console.log(`✅ Storage version set to ${version}`);
  } catch (error) {
    console.error('Error setting storage version:', error);
  }
}

/**
 * Load and migrate data from localStorage with version checking
 * @param {string} key - localStorage key
 * @returns {Object|null} - Migrated data or null
 */
export function loadVersionedData(key) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    const currentVersion = parsed.version || 0;
    const expectedVersion = STORAGE_VERSION;

    // Data is up to date
    if (currentVersion === expectedVersion) {
      console.log(`✅ localStorage data is current (v${currentVersion})`);
      return parsed;
    }

    // Data needs migration
    if (currentVersion < expectedVersion) {
      console.log(`🔄 Migrating localStorage from v${currentVersion} to v${expectedVersion}`);

      let migrated = parsed;

      // Apply migrations sequentially
      if (currentVersion === 0 || currentVersion === 1) {
        migrated = migrateV1ToV2(parsed);
      }

      // Future migrations would go here:
      // if (currentVersion < 3) {
      //   migrated = migrateV2ToV3(migrated);
      // }

      if (migrated) {
        // Save migrated data
        localStorage.setItem(key, JSON.stringify(migrated));
        setStorageVersion(expectedVersion);
        console.log(`✅ Migration complete: v${currentVersion} → v${expectedVersion}`);
      } else {
        console.warn('⚠️  Migration returned null - clearing invalid data');
        localStorage.removeItem(key);
      }

      return migrated;
    }

    // Data version is NEWER than expected (user downgraded app?)
    if (currentVersion > expectedVersion) {
      console.warn(
        `⚠️  localStorage version (v${currentVersion}) is newer than expected (v${expectedVersion}). ` +
          `This may indicate the user is running an older version of the app. Clearing data for safety.`
      );
      localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error loading versioned data:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignore cleanup errors
    }
    return null;
  }
}

/**
 * Save data to localStorage with version stamp
 * @param {string} key - localStorage key
 * @param {Object} data - Data to save
 * @returns {boolean} - Success status
 */
export function saveVersionedData(key, data) {
  try {
    const versionedData = {
      version: STORAGE_VERSION,
      ...data,
    };

    localStorage.setItem(key, JSON.stringify(versionedData));
    setStorageVersion(STORAGE_VERSION);

    return true;
  } catch (error) {
    console.error('Error saving versioned data:', error);
    return false;
  }
}

/**
 * Clear all versioned data (for testing or reset)
 * @param {string} key - localStorage key to clear
 */
export function clearVersionedData(key) {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️  Cleared versioned data: ${key}`);
  } catch (error) {
    console.error('Error clearing versioned data:', error);
  }
}

/**
 * Check if storage needs migration
 * @returns {boolean} - True if migration needed
 */
export function needsMigration() {
  const currentVersion = getStorageVersion();
  return currentVersion < STORAGE_VERSION;
}

/**
 * Get migration info for debugging
 * @returns {Object} - Migration status info
 */
export function getMigrationInfo() {
  const currentVersion = getStorageVersion();
  const expectedVersion = STORAGE_VERSION;

  return {
    currentVersion,
    expectedVersion,
    needsMigration: currentVersion < expectedVersion,
    isDowngrade: currentVersion > expectedVersion,
    isUpToDate: currentVersion === expectedVersion,
  };
}
