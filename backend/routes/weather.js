const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const climateService = require('../services/climateService');

/**
 * Test Visual Crossing API connection
 * GET /api/weather/test
 */
router.get('/test', async (req, res) => {
  try {
    const result = await weatherService.testApiConnection();

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          location: result.location,
          currentTemp: result.currentTemp,
          queryCost: result.queryCost
        }
      });
    } else {
      res.status(500).json({
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
 * Get current weather for a location
 * GET /api/weather/current/:location
 * Example: /api/weather/current/London,UK
 */
router.get('/current/:location', async (req, res) => {
  try {
    const { location } = req.params;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    // 🚨 REGRESSION MONITORING: Check for "Your Location" from frontend
    if (location === 'Your Location' || location === 'Old Location') {
      console.error('🚨🚨🚨 CRITICAL REGRESSION DETECTED! 🚨🚨🚨');
      console.error(`Frontend sent placeholder string: "${location}"`);
      console.error('The "Old Location" bug has returned in the frontend!');
      console.error('See: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md');
      console.error('Request headers:', req.headers);

      return res.status(400).json({
        success: false,
        error: 'Invalid location: Placeholder strings are not allowed. Please provide coordinates or city name.',
        regression: true
      });
    }

    const result = await weatherService.getCurrentWeather(location);

    // 🚨 REGRESSION MONITORING: Check if backend returned placeholder
    if (result.success && result.location) {
      const address = result.location.address;
      if (address === 'Old Location' || address === 'Your Location') {
        console.error('🚨🚨🚨 CRITICAL REGRESSION DETECTED IN BACKEND! 🚨🚨🚨');
        console.error(`Backend returned placeholder: "${address}"`);
        console.error('The sanitization logic failed!');
        console.error('Request location:', location);
        console.error('See: docs/troubleshooting/OLD_LOCATION_BUG_FIX.md');
      }

      // Also check if it's raw coordinates (should have been resolved by Nominatim)
      const isCoordinateString = /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(address);
      if (isCoordinateString && address.includes(result.location.latitude.toString())) {
        console.warn('⚠️  Backend returned coordinates instead of city name');
        console.warn(`Address: "${address}" for location: "${location}"`);
        console.warn('This suggests Nominatim reverse geocoding may have failed');
      }
    }

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json({
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
 * Get weather forecast for a location
 * GET /api/weather/forecast/:location?days=7
 * Example: /api/weather/forecast/Paris,France?days=5
 */
router.get('/forecast/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const days = parseInt(req.query.days) || 7;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    if (days < 1 || days > 15) {
      return res.status(400).json({
        success: false,
        error: 'Days must be between 1 and 15'
      });
    }

    const result = await weatherService.getForecast(location, days);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json({
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
 * Get hourly weather forecast for a location
 * GET /api/weather/hourly/:location?hours=48
 * Example: /api/weather/hourly/Seattle,WA?hours=72
 */
router.get('/hourly/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const hours = parseInt(req.query.hours) || 48;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    if (hours < 1 || hours > 240) {
      return res.status(400).json({
        success: false,
        error: 'Hours must be between 1 and 240'
      });
    }

    const result = await weatherService.getHourlyForecast(location, hours);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json({
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
 * Get historical weather data for a location
 * GET /api/weather/historical/:location?start=2023-01-01&end=2023-12-31
 * Example: /api/weather/historical/Tokyo,Japan?start=2024-01-01&end=2024-01-31
 */
router.get('/historical/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { start, end } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Start and end date parameters are required (format: YYYY-MM-DD)'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const result = await weatherService.getHistoricalWeather(location, start, end);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.statusCode || 500).json({
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
 * Get climate normals for a location and date
 * GET /api/weather/climate/normals/:location?date=MM-DD&years=10
 * Example: /api/weather/climate/normals/Seattle,WA?date=07-15&years=10
 */
router.get('/climate/normals/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { date, years } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required (format: MM-DD)'
      });
    }

    // Validate date format
    const dateRegex = /^\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use MM-DD'
      });
    }

    const yearsToAnalyze = parseInt(years) || 10;
    const result = await climateService.getClimateNormals(location, date, yearsToAnalyze);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
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
 * Get record temperatures for a location and date range
 * GET /api/weather/climate/records/:location?start=MM-DD&end=MM-DD&years=10
 * Example: /api/weather/climate/records/London,UK?start=06-01&end=06-30&years=10
 */
router.get('/climate/records/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { start, end, years } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Start and end date parameters are required (format: MM-DD)'
      });
    }

    // Validate date format
    const dateRegex = /^\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use MM-DD'
      });
    }

    const yearsToAnalyze = parseInt(years) || 10;
    const result = await climateService.getRecordTemperatures(location, start, end, yearsToAnalyze);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
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
 * Compare forecast with historical averages
 * POST /api/weather/climate/compare/:location
 * Body: { forecastData: [...], years: 10 }
 */
router.post('/climate/compare/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { forecastData, years } = req.body;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    if (!forecastData || !Array.isArray(forecastData)) {
      return res.status(400).json({
        success: false,
        error: 'Forecast data array is required in request body'
      });
    }

    const yearsToAnalyze = parseInt(years) || 10;
    const result = await climateService.compareForecastToHistorical(location, forecastData, yearsToAnalyze);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
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
 * Get "This Day in History" weather data
 * GET /api/weather/climate/this-day/:location?date=MM-DD&years=10
 * Example: /api/weather/climate/this-day/Paris,France?date=12-25&years=10
 */
router.get('/climate/this-day/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { date, years } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    // Validate date format if provided
    if (date) {
      const dateRegex = /^\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use MM-DD'
        });
      }
    }

    const yearsToAnalyze = parseInt(years) || 10;
    const result = await climateService.getThisDayInHistory(location, date, yearsToAnalyze);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
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
 * Get temperature probability distribution
 * GET /api/weather/climate/probability/:location?start=MM-DD&end=MM-DD&years=10
 * Example: /api/weather/climate/probability/Tokyo,Japan?start=01-01&end=01-31&years=10
 */
router.get('/climate/probability/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { start, end, years } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Start and end date parameters are required (format: MM-DD)'
      });
    }

    // Validate date format
    const dateRegex = /^\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use MM-DD'
      });
    }

    const yearsToAnalyze = parseInt(years) || 10;
    const result = await climateService.getTemperatureProbability(location, start, end, yearsToAnalyze);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({
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
 * Get historical weather for specific date across multiple years
 * GET /api/weather/historical-date
 * Query params: location, date (MM-DD), years (default 25)
 *
 * Example: /api/weather/historical-date?location=Seattle,WA&date=11-01&years=25
 * Returns: Last 25 years of weather data for November 1st
 */
router.get('/historical-date', async (req, res) => {
  try {
    const { location, date, years = 25 } = req.query;

    if (!location || !date) {
      return res.status(400).json({
        success: false,
        error: 'Location and date (MM-DD) are required'
      });
    }

    // Validate date format (MM-DD)
    const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Date must be in MM-DD format (e.g., 11-01)'
      });
    }

    const historicalData = await weatherService.getHistoricalDateData(
      location,
      date,
      parseInt(years)
    );

    res.json({
      success: true,
      data: historicalData
    });
  } catch (error) {
    console.error('Error fetching historical date data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
