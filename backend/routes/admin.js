const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminMiddleware');
const adminService = require('../services/adminService');

/**
 * Admin Routes
 * All routes require admin authentication
 */

/**
 * GET /api/admin/stats
 * Get comprehensive system statistics
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await adminService.getSystemStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system statistics'
    });
  }
});

/**
 * GET /api/admin/health
 * Get system health check
 */
router.get('/health', requireAdmin, async (req, res) => {
  try {
    const health = await adminService.getSystemHealth();

    res.json({
      success: true,
      health
    });
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system health'
    });
  }
});

/**
 * POST /api/admin/cache/clear-expired
 * Clear expired cache entries
 */
router.post('/cache/clear-expired', requireAdmin, async (req, res) => {
  try {
    const result = await adminService.clearExpiredCache();

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} expired cache entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear expired cache'
    });
  }
});

/**
 * POST /api/admin/cache/clear-all
 * Clear all cache entries (use with caution!)
 */
router.post('/cache/clear-all', requireAdmin, async (req, res) => {
  try {
    const result = await adminService.clearAllCache();

    res.json({
      success: true,
      message: `Cleared all ${result.deletedCount} cache entries`,
      deletedCount: result.deletedCount,
      warning: 'All cache cleared. Next requests will be slower until cache rebuilds.'
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

/**
 * POST /api/admin/cache/clear-source
 * Clear cache for specific API source
 * Body: { apiSource: 'visualcrossing' | 'openweather' | etc }
 */
router.post('/cache/clear-source', requireAdmin, async (req, res) => {
  try {
    const { apiSource } = req.body;

    if (!apiSource) {
      return res.status(400).json({
        success: false,
        error: 'apiSource is required'
      });
    }

    const result = await adminService.clearCacheBySource(apiSource);

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} cache entries for ${apiSource}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing cache by source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache by source'
    });
  }
});

/**
 * GET /api/admin/database
 * Get detailed database statistics
 */
router.get('/database', requireAdmin, async (req, res) => {
  try {
    const dbStats = await adminService.getDatabaseStats();

    res.json({
      success: true,
      database: dbStats
    });
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database statistics'
    });
  }
});

/**
 * GET /api/admin/users
 * Get user statistics
 */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const userStats = await adminService.getUserStats();

    res.json({
      success: true,
      users: userStats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user statistics'
    });
  }
});

/**
 * GET /api/admin/weather
 * Get weather data statistics
 */
router.get('/weather', requireAdmin, async (req, res) => {
  try {
    const weatherStats = await adminService.getWeatherStats();

    res.json({
      success: true,
      weather: weatherStats
    });
  } catch (error) {
    console.error('Error getting weather stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve weather statistics'
    });
  }
});

/**
 * GET /api/admin/ai
 * Get AI usage statistics
 */
router.get('/ai', requireAdmin, async (req, res) => {
  try {
    const aiStats = await adminService.getAIStats();

    res.json({
      success: true,
      ai: aiStats
    });
  } catch (error) {
    console.error('Error getting AI stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve AI statistics'
    });
  }
});

/**
 * GET /api/admin/api-usage
 * Get API usage statistics
 */
router.get('/api-usage', requireAdmin, async (req, res) => {
  try {
    const apiStats = await adminService.getAPIStats();

    res.json({
      success: true,
      apiUsage: apiStats
    });
  } catch (error) {
    console.error('Error getting API stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve API usage statistics'
    });
  }
});

module.exports = router;
