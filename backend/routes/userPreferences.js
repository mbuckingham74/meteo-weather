/**
 * User Preferences API Routes
 * Handles user preference CRUD operations with JWT authentication
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * GET /api/user-preferences
 * Get current user's preferences
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await pool.query(
      `SELECT
        temperature_unit,
        default_forecast_days,
        default_location,
        theme,
        language,
        email_notifications,
        daily_weather_report,
        weather_alert_notifications,
        weekly_summary,
        report_time,
        report_locations,
        updated_at
      FROM user_preferences
      WHERE user_id = ?`,
      [userId]
    );

    // If no preferences exist, return defaults
    if (rows.length === 0) {
      return res.json({
        temperature_unit: 'F',
        default_forecast_days: 7,
        default_location: null,
        theme: 'auto',
        language: 'en',
        email_notifications: false,
        daily_weather_report: false,
        weather_alert_notifications: true,
        weekly_summary: false,
        report_time: '08:00:00',
        report_locations: []
      });
    }

    const preferences = rows[0];

    // Parse JSON fields
    if (preferences.report_locations) {
      preferences.report_locations = JSON.parse(preferences.report_locations);
    } else {
      preferences.report_locations = [];
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      error: 'Failed to fetch preferences',
      details: error.message
    });
  }
});

/**
 * PUT /api/user-preferences
 * Update user preferences (upsert: create if not exists, update if exists)
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      temperature_unit,
      default_forecast_days,
      default_location,
      theme,
      language,
      email_notifications,
      daily_weather_report,
      weather_alert_notifications,
      weekly_summary,
      report_time,
      report_locations
    } = req.body;

    // Validate input
    if (temperature_unit && !['C', 'F'].includes(temperature_unit)) {
      return res.status(400).json({ error: 'Invalid temperature unit. Must be C or F.' });
    }

    if (theme && !['light', 'dark', 'auto'].includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme. Must be light, dark, or auto.' });
    }

    if (default_forecast_days && (default_forecast_days < 1 || default_forecast_days > 14)) {
      return res.status(400).json({ error: 'Forecast days must be between 1 and 14.' });
    }

    // Prepare report_locations JSON
    const reportLocationsJson = report_locations ? JSON.stringify(report_locations) : null;

    // Upsert query (MySQL 5.7+ / MariaDB 10.3+)
    const query = `
      INSERT INTO user_preferences (
        user_id,
        temperature_unit,
        default_forecast_days,
        default_location,
        theme,
        language,
        email_notifications,
        daily_weather_report,
        weather_alert_notifications,
        weekly_summary,
        report_time,
        report_locations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        temperature_unit = COALESCE(VALUES(temperature_unit), temperature_unit),
        default_forecast_days = COALESCE(VALUES(default_forecast_days), default_forecast_days),
        default_location = COALESCE(VALUES(default_location), default_location),
        theme = COALESCE(VALUES(theme), theme),
        language = COALESCE(VALUES(language), language),
        email_notifications = COALESCE(VALUES(email_notifications), email_notifications),
        daily_weather_report = COALESCE(VALUES(daily_weather_report), daily_weather_report),
        weather_alert_notifications = COALESCE(VALUES(weather_alert_notifications), weather_alert_notifications),
        weekly_summary = COALESCE(VALUES(weekly_summary), weekly_summary),
        report_time = COALESCE(VALUES(report_time), report_time),
        report_locations = COALESCE(VALUES(report_locations), report_locations),
        updated_at = CURRENT_TIMESTAMP
    `;

    await pool.query(query, [
      userId,
      temperature_unit || 'F',
      default_forecast_days || 7,
      default_location || null,
      theme || 'auto',
      language || 'en',
      email_notifications !== undefined ? email_notifications : false,
      daily_weather_report !== undefined ? daily_weather_report : false,
      weather_alert_notifications !== undefined ? weather_alert_notifications : true,
      weekly_summary !== undefined ? weekly_summary : false,
      report_time || '08:00:00',
      reportLocationsJson
    ]);

    // Fetch updated preferences
    const [rows] = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    const updatedPreferences = rows[0];
    if (updatedPreferences.report_locations) {
      updatedPreferences.report_locations = JSON.parse(updatedPreferences.report_locations);
    }

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      details: error.message
    });
  }
});

/**
 * PATCH /api/user-preferences
 * Partially update user preferences (only update provided fields)
 */
router.patch('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    // Validate provided fields
    if (updates.temperature_unit && !['C', 'F'].includes(updates.temperature_unit)) {
      return res.status(400).json({ error: 'Invalid temperature unit' });
    }

    if (updates.theme && !['light', 'dark', 'auto'].includes(updates.theme)) {
      return res.status(400).json({ error: 'Invalid theme' });
    }

    // Build dynamic update query
    const fields = [];
    const values = [];

    const allowedFields = [
      'temperature_unit',
      'default_forecast_days',
      'default_location',
      'theme',
      'language',
      'email_notifications',
      'daily_weather_report',
      'weather_alert_notifications',
      'weekly_summary',
      'report_time',
      'report_locations'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(
          field === 'report_locations' ? JSON.stringify(updates[field]) : updates[field]
        );
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(userId);

    const query = `
      UPDATE user_preferences
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User preferences not found. Use PUT to create.' });
    }

    // Fetch updated preferences
    const [rows] = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    const updatedPreferences = rows[0];
    if (updatedPreferences.report_locations) {
      updatedPreferences.report_locations = JSON.parse(updatedPreferences.report_locations);
    }

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Error patching user preferences:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      details: error.message
    });
  }
});

/**
 * DELETE /api/user-preferences
 * Reset user preferences to defaults (delete custom preferences)
 */
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await pool.query('DELETE FROM user_preferences WHERE user_id = ?', [userId]);

    res.json({ message: 'Preferences reset to defaults' });
  } catch (error) {
    console.error('Error deleting user preferences:', error);
    res.status(500).json({
      error: 'Failed to reset preferences',
      details: error.message
    });
  }
});

module.exports = router;
