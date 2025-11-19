const { pool } = require('../config/database');

/**
 * User Preferences Service
 * Handles user-specific settings and preferences
 */

/**
 * Get user preferences
 */
async function getUserPreferences(userId) {
  try {
    const [preferences] = await pool.query(
      `SELECT
        temperature_unit,
        default_forecast_days,
        default_location,
        theme
      FROM user_preferences
      WHERE user_id = ?`,
      [userId]
    );

    if (preferences.length === 0) {
      // Create default preferences if they don't exist
      await pool.query(
        'INSERT INTO user_preferences (user_id) VALUES (?)',
        [userId]
      );

      return {
        temperature_unit: 'C',
        default_forecast_days: 7,
        default_location: null,
        theme: 'light'
      };
    }

    return preferences[0];
  } catch (error) {
    console.error('Get preferences error:', error);
    throw error;
  }
}

/**
 * Update user preferences
 */
async function updateUserPreferences(userId, updates) {
  try {
    const allowedFields = [
      'temperature_unit',
      'default_forecast_days',
      'default_location',
      'theme'
    ];

    const updateFields = [];
    const updateValues = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateValues.push(userId);

    // Check if preferences exist
    const [existing] = await pool.query(
      'SELECT id FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    if (existing.length === 0) {
      // Create preferences first
      await pool.query(
        'INSERT INTO user_preferences (user_id) VALUES (?)',
        [userId]
      );
    }

    await pool.query(
      `UPDATE user_preferences SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );

    return await getUserPreferences(userId);
  } catch (error) {
    console.error('Update preferences error:', error);
    throw error;
  }
}

module.exports = {
  getUserPreferences,
  updateUserPreferences
};
