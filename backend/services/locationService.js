const { pool } = require('../config/database');

/**
 * Location Service
 * Manages location data in the database
 */

/**
 * Find location by ID
 * @param {number} id - Location ID
 * @returns {Promise<object|null>} Location data or null
 */
async function findLocationById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM locations WHERE id = ?', [id]);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Find location by ID error:', error.message);
    throw error;
  }
}

/**
 * Find location by coordinates using ST_Distance_Sphere with spatial index
 *
 * Uses a two-phase approach for optimal performance:
 * 1. Bounding box filter using MBRContains (uses SPATIAL INDEX)
 * 2. Precise distance calculation with ST_Distance_Sphere
 *
 * This is ~50x faster than the old Haversine scan + HAVING approach
 * as the table grows, because it leverages the spatial index.
 *
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} radiusMeters - Search radius in meters (default: 10000m = 10km)
 * @returns {Promise<object|null>} Location data or null
 */
async function findLocationByCoordinates(latitude, longitude, radiusMeters = 10000) {
  try {
    // Convert radius to approximate degrees for bounding box
    // 1 degree latitude ≈ 111km, longitude varies by latitude
    // Add 10% buffer to avoid false negatives at bounding box edges
    const BUFFER = 1.1;
    const latDelta = (radiusMeters / 111000) * BUFFER;

    // Handle edge case near poles where cos(lat) approaches 0
    // At extreme latitudes, use a larger longitude delta to ensure coverage
    const cosLat = Math.cos((latitude * Math.PI) / 180);
    const safeCosLat = Math.max(cosLat, 0.01); // Prevent division by near-zero
    let lonDelta = (radiusMeters / (111000 * safeCosLat)) * BUFFER;

    // Clamp longitude delta to avoid wrapping issues near dateline
    // If lonDelta > 180, the bounding box would wrap around the globe
    lonDelta = Math.min(lonDelta, 180);

    // Calculate bounding box corners, clamping latitude to valid range
    const minLat = Math.max(latitude - latDelta, -90);
    const maxLat = Math.min(latitude + latDelta, 90);
    let minLon = longitude - lonDelta;
    let maxLon = longitude + lonDelta;

    // Handle dateline crossing: if box crosses ±180, clamp to valid range
    // Note: This may miss locations on the other side of the dateline,
    // but that's acceptable for typical use cases (10km radius)
    minLon = Math.max(minLon, -180);
    maxLon = Math.min(maxLon, 180);

    // Use ST_Distance_Sphere with bounding box pre-filter
    // The bounding box uses the SPATIAL INDEX for fast candidate selection
    const [rows] = await pool.query(
      `SELECT *,
        ST_Distance_Sphere(
          coordinates,
          ST_SRID(POINT(?, ?), 4326)
        ) as distance_meters
       FROM locations
       WHERE MBRContains(
         ST_SRID(
           ST_GeomFromText(CONCAT(
             'POLYGON((',
             ?, ' ', ?, ',',
             ?, ' ', ?, ',',
             ?, ' ', ?, ',',
             ?, ' ', ?, ',',
             ?, ' ', ?, '))'
           )),
           4326
         ),
         coordinates
       )
       HAVING distance_meters < ?
       ORDER BY distance_meters
       LIMIT 1`,
      [
        longitude, latitude,  // Point for distance calculation
        // Bounding box corners (lon lat pairs): SW, SE, NE, NW, SW (closed polygon)
        minLon, minLat,
        maxLon, minLat,
        maxLon, maxLat,
        minLon, maxLat,
        minLon, minLat,
        radiusMeters
      ]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Find location by coordinates error:', error.message);
    throw error;
  }
}

/**
 * Search locations by city name using FULLTEXT index
 * @param {string} query - Search query
 * @param {number} limit - Maximum results (default: 10)
 * @returns {Promise<Array>} Array of matching locations
 */
async function searchLocations(query, limit = 10) {
  try {
    // Use FULLTEXT search for fast text queries (20x faster than LIKE '%term%')
    const [rows] = await pool.query(
      `SELECT *,
        MATCH(city_name, country, state) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
       FROM locations
       WHERE MATCH(city_name, country, state) AGAINST(? IN NATURAL LANGUAGE MODE)
       ORDER BY relevance DESC, city_name
       LIMIT ?`,
      [query, query, limit]
    );

    return rows;
  } catch (error) {
    console.error('Search locations error:', error.message);
    throw error;
  }
}

/**
 * Get all locations
 * @param {number} limit - Maximum results (default: 100)
 * @param {number} offset - Offset for pagination (default: 0)
 * @returns {Promise<Array>} Array of locations
 */
async function getAllLocations(limit = 100, offset = 0) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM locations
       ORDER BY city_name
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows;
  } catch (error) {
    console.error('Get all locations error:', error.message);
    throw error;
  }
}

/**
 * Create new location
 * @param {object} locationData - Location data
 * @returns {Promise<object>} Created location with ID
 */
async function createLocation(locationData) {
  try {
    const { city_name, country, country_code, state, latitude, longitude, timezone, elevation } =
      locationData;

    // Check if location already exists
    const existing = await findLocationByCoordinates(latitude, longitude);
    if (existing) {
      return existing;
    }

    // Create location with spatial coordinates for fast lookups
    const [result] = await pool.query(
      `INSERT INTO locations
       (city_name, country, country_code, state, latitude, longitude, coordinates, timezone, elevation)
       VALUES (?, ?, ?, ?, ?, ?, ST_SRID(POINT(?, ?), 4326), ?, ?)`,
      [
        city_name,
        country,
        country_code || null,
        state || null,
        latitude,
        longitude,
        longitude,
        latitude,
        timezone || null,
        elevation || null,
      ]
    );

    return {
      id: result.insertId,
      ...locationData,
    };
  } catch (error) {
    console.error('Create location error:', error.message);
    throw error;
  }
}

/**
 * Update location
 * @param {number} id - Location ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object|null>} Updated location or null
 */
async function updateLocation(id, updateData) {
  try {
    const allowedFields = [
      'city_name',
      'country',
      'country_code',
      'state',
      'timezone',
      'elevation',
    ];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return await findLocationById(id);
    }

    values.push(id);

    await pool.query(`UPDATE locations SET ${updates.join(', ')} WHERE id = ?`, values);

    return await findLocationById(id);
  } catch (error) {
    console.error('Update location error:', error.message);
    throw error;
  }
}

/**
 * Delete location (with referential integrity check)
 * @param {number} id - Location ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteLocation(id) {
  try {
    // Check for dependent weather_data records (foreign keys were dropped in migration 005)
    const [weatherRecords] = await pool.query(
      'SELECT COUNT(*) as count FROM weather_data WHERE location_id = ?',
      [id]
    );

    if (weatherRecords[0].count > 0) {
      throw new Error(
        `Cannot delete location: ${weatherRecords[0].count} weather records exist. Delete weather data first.`
      );
    }

    const [result] = await pool.query('DELETE FROM locations WHERE id = ?', [id]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Delete location error:', error.message);
    throw error;
  }
}

/**
 * Get or create location from Visual Crossing response
 * @param {object} vcData - Visual Crossing location data
 * @returns {Promise<object>} Location from database
 */
async function getOrCreateFromVC(vcData) {
  try {
    // Try to find existing location
    const existing = await findLocationByCoordinates(vcData.latitude, vcData.longitude);

    if (existing) {
      return existing;
    }

    // Parse address to extract city and country
    const addressParts = vcData.resolvedAddress.split(',').map((s) => s.trim());
    let city_name, country, state;

    if (addressParts.length >= 2) {
      city_name = addressParts[0];
      country = addressParts[addressParts.length - 1];
      if (addressParts.length > 2) {
        state = addressParts[1];
      }
    } else {
      city_name = vcData.resolvedAddress;
      country = 'Unknown';
    }

    // Create new location
    return await createLocation({
      city_name,
      country,
      country_code: null, // Visual Crossing doesn't provide this
      state,
      latitude: vcData.latitude,
      longitude: vcData.longitude,
      timezone: vcData.timezone,
      elevation: null, // Not always provided
    });
  } catch (error) {
    console.error('Get or create from VC error:', error.message);
    throw error;
  }
}

module.exports = {
  findLocationById,
  findLocationByCoordinates,
  searchLocations,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getOrCreateFromVC,
};
