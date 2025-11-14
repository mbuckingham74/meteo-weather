const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

/**
 * Authentication Service
 * Handles user registration, login, and token management
 */

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
async function registerUser(email, password, name) {
  try {
    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      throw new Error('Email already registered');
    }

    // Check if this is the first user (will become admin)
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const isFirstUser = userCount[0].count === 0;

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user (first user is automatically admin)
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, name, is_admin) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name, isFirstUser]
    );

    const userId = result.insertId;

    if (isFirstUser) {
      console.log(`🔧 First user registered as admin: ${email}`);
    }

    // Create default preferences
    await pool.query(
      'INSERT INTO user_preferences (user_id) VALUES (?)',
      [userId]
    );

    // Generate tokens (include admin status)
    const tokens = generateTokens(userId, email, isFirstUser);

    return {
      user: {
        id: userId,
        email,
        name,
        isAdmin: isFirstUser
      },
      ...tokens
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login user
 */
async function loginUser(email, password) {
  try {
    // Find user (include admin status)
    const [users] = await pool.query(
      'SELECT id, email, password_hash, username, is_admin FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate tokens (include admin status)
    const tokens = generateTokens(user.id, user.email, user.is_admin);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.username,
        isAdmin: user.is_admin
      },
      ...tokens
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Generate JWT access and refresh tokens
 */
function generateTokens(userId, email, isAdmin = false) {
  const accessToken = jwt.sign(
    { userId, email, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { userId, email, isAdmin },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return {
    accessToken,
    refreshToken
  };
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken) {
  try {
    const decoded = verifyRefreshToken(refreshToken);

    // Verify user still exists (include admin status)
    const [users] = await pool.query(
      'SELECT id, email, is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Generate new access token (include admin status)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return { accessToken };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  try {
    const [users] = await pool.query(
      'SELECT id, email, username, is_admin, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Return user with isAdmin in camelCase
    return {
      id: user.id,
      email: user.email,
      name: user.username,
      isAdmin: user.is_admin,
      created_at: user.created_at,
      last_login: user.last_login
    };
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
async function updateUserProfile(userId, updates) {
  try {
    const allowedFields = ['name', 'email'];
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

    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    return await getUserById(userId);
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

/**
 * Change user password
 */
async function changePassword(userId, currentPassword, newPassword) {
  try {
    // Get current password hash
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
  getUserById,
  updateUserProfile,
  changePassword
};
