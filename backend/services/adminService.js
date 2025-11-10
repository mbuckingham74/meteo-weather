const db = require('../config/database');

/**
 * Admin Service
 * Provides statistics and management functions for the admin panel
 */

class AdminService {
  /**
   * Get comprehensive system statistics
   */
  async getSystemStats() {
    try {
      const stats = {
        database: await this.getDatabaseStats(),
        users: await this.getUserStats(),
        weather: await this.getWeatherStats(),
        cache: await this.getCacheStats(),
        ai: await this.getAIStats(),
        api: await this.getAPIStats()
      };

      return stats;
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const [dbSize] = await db.query(`
        SELECT
          SUM(data_length + index_length) / 1024 / 1024 AS size_mb,
          COUNT(*) AS table_count
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
      `);

      const [tableSizes] = await db.query(`
        SELECT
          table_name,
          ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb,
          table_rows
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        ORDER BY (data_length + index_length) DESC
        LIMIT 10
      `);

      return {
        totalSizeMB: Math.round(dbSize[0].size_mb * 100) / 100,
        tableCount: dbSize[0].table_count,
        largestTables: tableSizes
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        totalSizeMB: 0,
        tableCount: 0,
        largestTables: []
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');

      const [recentUsers] = await db.query(`
        SELECT COUNT(*) as count
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);

      const [activeUsers] = await db.query(`
        SELECT COUNT(*) as count
        FROM users
        WHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);

      const [usersWithFavorites] = await db.query(`
        SELECT COUNT(DISTINCT user_id) as count FROM user_favorites
      `);

      const [avgFavorites] = await db.query(`
        SELECT AVG(favorite_count) as avg_favorites
        FROM (
          SELECT user_id, COUNT(*) as favorite_count
          FROM user_favorites
          GROUP BY user_id
        ) as user_favorite_counts
      `);

      return {
        total: totalUsers[0].count,
        recentSignups: recentUsers[0].count,
        activeLastMonth: activeUsers[0].count,
        withFavorites: usersWithFavorites[0].count,
        avgFavoritesPerUser: Math.round((avgFavorites[0].avg_favorites || 0) * 10) / 10
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        total: 0,
        recentSignups: 0,
        activeLastMonth: 0,
        withFavorites: 0,
        avgFavoritesPerUser: 0
      };
    }
  }

  /**
   * Get weather data statistics
   */
  async getWeatherStats() {
    try {
      const [locationCount] = await db.query('SELECT COUNT(*) as count FROM locations');

      const [weatherDataCount] = await db.query('SELECT COUNT(*) as count FROM weather_data');

      const [mostQueriedLocations] = await db.query(`
        SELECT
          l.city_name,
          l.country,
          COUNT(ac.id) as query_count
        FROM locations l
        LEFT JOIN api_cache ac ON l.id = ac.location_id
        WHERE ac.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY l.id, l.city_name, l.country
        ORDER BY query_count DESC
        LIMIT 10
      `);

      const [recentLocations] = await db.query(`
        SELECT city_name, country, created_at
        FROM locations
        ORDER BY created_at DESC
        LIMIT 5
      `);

      const [dataSourceBreakdown] = await db.query(`
        SELECT
          data_source,
          COUNT(*) as count
        FROM weather_data
        GROUP BY data_source
      `);

      return {
        totalLocations: locationCount[0].count,
        totalWeatherRecords: weatherDataCount[0].count,
        mostQueriedLocations,
        recentlyAddedLocations: recentLocations,
        dataSourceBreakdown
      };
    } catch (error) {
      console.error('Error getting weather stats:', error);
      return {
        totalLocations: 0,
        totalWeatherRecords: 0,
        mostQueriedLocations: [],
        recentlyAddedLocations: [],
        dataSourceBreakdown: []
      };
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const [cacheStats] = await db.query(`
        SELECT
          COUNT(*) as total_entries,
          SUM(CASE WHEN expires_at > NOW() THEN 1 ELSE 0 END) as valid_entries,
          SUM(CASE WHEN expires_at <= NOW() THEN 1 ELSE 0 END) as expired_entries,
          api_source,
          COUNT(*) as source_count
        FROM api_cache
        GROUP BY api_source
      `);

      const [totalCache] = await db.query('SELECT COUNT(*) as count FROM api_cache');

      const [validCache] = await db.query(`
        SELECT COUNT(*) as count FROM api_cache WHERE expires_at > NOW()
      `);

      const [cacheHitRate] = await db.query(`
        SELECT
          SUM(CASE WHEN expires_at > NOW() THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as hit_rate
        FROM api_cache
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);

      const [oldestCache] = await db.query(`
        SELECT cache_key, created_at, expires_at, api_source
        FROM api_cache
        WHERE expires_at > NOW()
        ORDER BY created_at ASC
        LIMIT 1
      `);

      return {
        totalEntries: totalCache[0].count,
        validEntries: validCache[0].count,
        expiredEntries: totalCache[0].count - validCache[0].count,
        hitRate: Math.round((cacheHitRate[0]?.hit_rate || 0) * 10) / 10,
        bySource: cacheStats,
        oldestEntry: oldestCache[0] || null
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        hitRate: 0,
        bySource: [],
        oldestEntry: null
      };
    }
  }

  /**
   * Get AI usage statistics
   */
  async getAIStats() {
    try {
      const [totalShares] = await db.query('SELECT COUNT(*) as count FROM shared_ai_answers');

      const [recentShares] = await db.query(`
        SELECT COUNT(*) as count
        FROM shared_ai_answers
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);

      const [totalViews] = await db.query('SELECT SUM(views) as total FROM shared_ai_answers');

      const [totalTokens] = await db.query('SELECT SUM(tokens_used) as total FROM shared_ai_answers');

      const [avgTokens] = await db.query('SELECT AVG(tokens_used) as avg FROM shared_ai_answers');

      const [topSharedAnswers] = await db.query(`
        SELECT
          share_id,
          question,
          location,
          views,
          confidence,
          tokens_used,
          created_at
        FROM shared_ai_answers
        ORDER BY views DESC
        LIMIT 10
      `);

      const [confidenceBreakdown] = await db.query(`
        SELECT
          confidence,
          COUNT(*) as count,
          AVG(tokens_used) as avg_tokens
        FROM shared_ai_answers
        GROUP BY confidence
      `);

      // Estimate costs (Claude Sonnet 4.5 pricing)
      const inputCostPer1M = 3; // $3 per million input tokens
      const outputCostPer1M = 15; // $15 per million output tokens
      // Assume 70% input, 30% output for rough estimate
      const totalCost = (totalTokens[0].total || 0) * 0.7 * inputCostPer1M / 1000000 +
                        (totalTokens[0].total || 0) * 0.3 * outputCostPer1M / 1000000;

      return {
        totalQueries: totalShares[0].count,
        queriesLast7Days: recentShares[0].count,
        totalViews: totalViews[0].total || 0,
        totalTokensUsed: totalTokens[0].total || 0,
        avgTokensPerQuery: Math.round(avgTokens[0].avg || 0),
        estimatedCostUSD: Math.round(totalCost * 100) / 100,
        topSharedAnswers,
        confidenceBreakdown
      };
    } catch (error) {
      console.error('Error getting AI stats:', error);
      return {
        totalQueries: 0,
        queriesLast7Days: 0,
        totalViews: 0,
        totalTokensUsed: 0,
        avgTokensPerQuery: 0,
        estimatedCostUSD: 0,
        topSharedAnswers: [],
        confidenceBreakdown: []
      };
    }
  }

  /**
   * Get API usage statistics
   * Note: This is estimated from cache entries, not actual API calls
   */
  async getAPIStats() {
    try {
      const [cacheByDay] = await db.query(`
        SELECT
          DATE(created_at) as date,
          api_source,
          COUNT(*) as requests
        FROM api_cache
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at), api_source
        ORDER BY date DESC, api_source
        LIMIT 30
      `);

      const [totalRequests] = await db.query(`
        SELECT
          api_source,
          COUNT(*) as total_requests
        FROM api_cache
        GROUP BY api_source
      `);

      const [requestsLast24h] = await db.query(`
        SELECT
          api_source,
          COUNT(*) as requests
        FROM api_cache
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY api_source
      `);

      return {
        requestsByDay: cacheByDay,
        totalRequestsBySource: totalRequests,
        requestsLast24Hours: requestsLast24h,
        note: 'API stats are estimated from cache entries. Actual API calls may be lower due to cache hits.'
      };
    } catch (error) {
      console.error('Error getting API stats:', error);
      return {
        requestsByDay: [],
        totalRequestsBySource: [],
        requestsLast24Hours: [],
        note: 'Error loading API statistics'
      };
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache() {
    try {
      const [result] = await db.query('DELETE FROM api_cache WHERE expires_at <= NOW()');
      return {
        success: true,
        deletedCount: result.affectedRows
      };
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      throw error;
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAllCache() {
    try {
      const [result] = await db.query('DELETE FROM api_cache');
      return {
        success: true,
        deletedCount: result.affectedRows
      };
    } catch (error) {
      console.error('Error clearing all cache:', error);
      throw error;
    }
  }

  /**
   * Clear cache for specific API source
   */
  async clearCacheBySource(apiSource) {
    try {
      const [result] = await db.query('DELETE FROM api_cache WHERE api_source = ?', [apiSource]);
      return {
        success: true,
        deletedCount: result.affectedRows
      };
    } catch (error) {
      console.error('Error clearing cache by source:', error);
      throw error;
    }
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth() {
    try {
      const [dbStatus] = await db.query('SELECT 1 as healthy');

      // Check for common issues
      const [expiredCacheCount] = await db.query(
        'SELECT COUNT(*) as count FROM api_cache WHERE expires_at <= NOW()'
      );

      const [oldExpiredShares] = await db.query(
        'SELECT COUNT(*) as count FROM shared_ai_answers WHERE expires_at <= NOW()'
      );

      const issues = [];
      if (expiredCacheCount[0].count > 1000) {
        issues.push({
          severity: 'warning',
          message: `${expiredCacheCount[0].count} expired cache entries should be cleaned up`,
          action: 'Run cache cleanup'
        });
      }

      if (oldExpiredShares[0].count > 100) {
        issues.push({
          severity: 'info',
          message: `${oldExpiredShares[0].count} expired AI shares could be archived`,
          action: 'Consider archiving old shares'
        });
      }

      return {
        database: dbStatus.length > 0 ? 'healthy' : 'unhealthy',
        issues,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        database: 'unhealthy',
        issues: [{ severity: 'error', message: error.message }],
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new AdminService();
