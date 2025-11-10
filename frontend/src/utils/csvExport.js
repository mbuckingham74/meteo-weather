/**
 * CSV Export Utility
 * Provides functions to export admin data as CSV files
 */

/**
 * Converts an array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional array of header names (uses object keys if not provided)
 * @returns {string} CSV formatted string
 */
export function convertToCSV(data, headers = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const columnHeaders = headers || Object.keys(data[0]);

  // Create CSV header row
  const headerRow = columnHeaders.map((header) => escapeCSVValue(header)).join(',');

  // Create CSV data rows
  const dataRows = data.map((row) => {
    return columnHeaders
      .map((header) => {
        const value = row[header];
        return escapeCSVValue(value);
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escapes a value for safe CSV formatting
 * @param {*} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Triggers a download of CSV data
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name for the downloaded file (without .csv extension)
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Exports admin overview statistics to CSV
 * @param {Object} stats - Admin statistics object
 */
export function exportOverviewStats(stats) {
  const data = [
    { category: 'Users', metric: 'Total Users', value: stats.users.total },
    { category: 'Users', metric: 'Active Last Month', value: stats.users.activeLastMonth },
    {
      category: 'Weather',
      metric: 'Total Locations',
      value: stats.weather.totalLocations,
    },
    {
      category: 'Weather',
      metric: 'Total Weather Records',
      value: stats.weather.totalWeatherRecords,
    },
    { category: 'AI', metric: 'Total Queries', value: stats.ai.totalQueries },
    { category: 'AI', metric: 'Queries Last 7 Days', value: stats.ai.queriesLast7Days },
    { category: 'AI', metric: 'Estimated Cost (USD)', value: stats.ai.estimatedCostUSD },
    { category: 'AI', metric: 'Total Tokens Used', value: stats.ai.totalTokensUsed },
    { category: 'Cache', metric: 'Hit Rate (%)', value: stats.cache.hitRate },
    { category: 'Cache', metric: 'Valid Entries', value: stats.cache.validEntries },
    { category: 'Database', metric: 'Total Size (MB)', value: stats.database.totalSizeMB },
    { category: 'Database', metric: 'Table Count', value: stats.database.tableCount },
  ];

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `admin-overview-${timestamp}`);
}

/**
 * Exports user statistics to CSV
 * @param {Object} userStats - User statistics object
 */
export function exportUserStats(userStats) {
  const data = [
    { metric: 'Total Users', value: userStats.total },
    { metric: 'Recent Signups (7 days)', value: userStats.recentSignups },
    { metric: 'Active Last Month', value: userStats.activeLastMonth },
    { metric: 'Users with Favorites', value: userStats.withFavorites },
    { metric: 'Average Favorites per User', value: userStats.avgFavoritesPerUser },
  ];

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `admin-users-${timestamp}`);
}

/**
 * Exports weather statistics to CSV
 * @param {Object} weatherStats - Weather statistics object
 */
export function exportWeatherStats(weatherStats) {
  // Export most queried locations
  const locations = weatherStats.mostQueriedLocations.map((loc, idx) => ({
    rank: idx + 1,
    city: loc.city_name,
    country: loc.country,
    query_count: loc.query_count,
  }));

  const csv = convertToCSV(locations);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `admin-top-locations-${timestamp}`);
}

/**
 * Exports AI usage statistics to CSV
 * @param {Object} aiStats - AI statistics object
 */
export function exportAIStats(aiStats) {
  const data = [
    { metric: 'Total Queries', value: aiStats.totalQueries },
    { metric: 'Queries Last 7 Days', value: aiStats.queriesLast7Days },
    { metric: 'Queries Last 30 Days', value: aiStats.queriesLast30Days },
    { metric: 'Average Response Time (s)', value: aiStats.avgResponseTime },
    { metric: 'Total Tokens Used', value: aiStats.totalTokensUsed },
    { metric: 'Estimated Cost (USD)', value: aiStats.estimatedCostUSD },
    { metric: 'Most Active User', value: aiStats.mostActiveUser?.email || 'N/A' },
    {
      metric: 'Most Active User Queries',
      value: aiStats.mostActiveUser?.query_count || 0,
    },
  ];

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `admin-ai-usage-${timestamp}`);
}

/**
 * Exports cache statistics to CSV
 * @param {Object} cacheStats - Cache statistics object
 */
export function exportCacheStats(cacheStats) {
  const data = [
    { metric: 'Total Entries', value: cacheStats.totalEntries },
    { metric: 'Valid Entries', value: cacheStats.validEntries },
    { metric: 'Expired Entries', value: cacheStats.expiredEntries },
    { metric: 'Hit Rate (%)', value: cacheStats.hitRate },
    { metric: 'Weather Cache Hits', value: cacheStats.weatherCacheHits },
    { metric: 'Weather Cache Total', value: cacheStats.weatherCacheTotal },
  ];

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `admin-cache-${timestamp}`);
}

/**
 * Exports database statistics to CSV
 * @param {Object} dbStats - Database statistics object
 */
export function exportDatabaseStats(dbStats) {
  // Export table information
  const tables = dbStats.tables.map((table) => ({
    table_name: table.table_name,
    size_mb: table.size_mb,
    row_count: table.row_count,
  }));

  const csv = convertToCSV(tables);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `admin-database-tables-${timestamp}`);
}
