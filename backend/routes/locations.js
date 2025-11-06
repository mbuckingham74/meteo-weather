const express = require('express');
const router = express.Router();
const locationService = require('../services/locationService');
const geocodingService = require('../services/geocodingService');

/**
 * Geocode location search (autocomplete)
 * GET /api/locations/geocode?q=London&limit=5
 */
router.get('/geocode', async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const maxLimit = parseInt(limit) || 5;
    const result = await geocodingService.searchLocations(q, maxLimit);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Reverse geocode coordinates
 * GET /api/locations/reverse?lat=51.5074&lon=-0.1278
 */
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude (lat) and longitude (lon) query parameters are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude'
      });
    }

    const result = await geocodingService.reverseGeocode(latitude, longitude);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get popular/suggested locations
 * GET /api/locations/popular
 */
router.get('/popular', (req, res) => {
  try {
    const result = geocodingService.getPopularLocations();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Search locations by name
 * GET /api/locations/search?q=London&limit=10
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const maxLimit = parseInt(limit) || 10;
    const locations = await locationService.searchLocations(q, maxLimit);

    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all locations (paginated)
 * GET /api/locations?limit=50&offset=0
 * IMPORTANT: This route MUST come before /:id to avoid being caught by the param route
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    if (limit > 500) {
      return res.status(400).json({
        success: false,
        error: 'Limit cannot exceed 500'
      });
    }

    const locations = await locationService.getAllLocations(limit, offset);

    res.json({
      success: true,
      count: locations.length,
      limit,
      offset,
      locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get location by ID
 * GET /api/locations/:id
 * IMPORTANT: This route MUST come after all specific routes (/reverse, /search, /popular, /)
 * because it's a catch-all pattern that matches any path
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location ID'
      });
    }

    const location = await locationService.findLocationById(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create new location
 * POST /api/locations
 * Body: { city_name, country, latitude, longitude, ... }
 */
router.post('/', async (req, res) => {
  try {
    const { city_name, country, latitude, longitude } = req.body;

    // Validate required fields
    if (!city_name || !country || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: city_name, country, latitude, longitude'
      });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates'
      });
    }

    const location = await locationService.createLocation(req.body);

    res.status(201).json({
      success: true,
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update location
 * PATCH /api/locations/:id
 * Body: { city_name?, country?, timezone?, ... }
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location ID'
      });
    }

    const location = await locationService.updateLocation(locationId, req.body);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete location
 * DELETE /api/locations/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location ID'
      });
    }

    const deleted = await locationService.deleteLocation(locationId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
