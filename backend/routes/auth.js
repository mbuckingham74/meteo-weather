const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserById,
  updateUserProfile,
  changePassword,
} = require('../services/authService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');
const { createError, ERROR_CODES } = require('../utils/errorCodes');

/**
 * Authentication Routes
 *
 * All routes use asyncHandler to automatically catch errors and pass them
 * to the centralized error handler. Validation errors throw ApiError with
 * appropriate error codes.
 */

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      throw createError(
        ERROR_CODES.VALIDATION_ERROR,
        'Email, password, and name are required'
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError(ERROR_CODES.VALIDATION_ERROR, 'Invalid email format');
    }

    // Password strength validation
    if (password.length < 6) {
      throw createError(
        ERROR_CODES.WEAK_PASSWORD,
        'Password must be at least 6 characters long'
      );
    }

    const result = await registerUser(email, password, name);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      ...result,
    });
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw createError(
        ERROR_CODES.VALIDATION_ERROR,
        'Email and password are required'
      );
    }

    const result = await loginUser(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      ...result,
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError(
        ERROR_CODES.VALIDATION_ERROR,
        'Refresh token is required'
      );
    }

    const result = await refreshAccessToken(refreshToken);

    res.json({
      success: true,
      ...result,
    });
  })
);

/**
 * GET /api/auth/me
 * Get current user profile
 * Protected route
 */
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.user.userId);

    res.json({
      success: true,
      user,
    });
  })
);

/**
 * PUT /api/auth/profile
 * Update user profile
 * Protected route
 */
router.put(
  '/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;

    const updatedUser = await updateUserProfile(req.user.userId, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  })
);

/**
 * POST /api/auth/change-password
 * Change user password
 * Protected route
 */
router.post(
  '/change-password',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      throw createError(
        ERROR_CODES.VALIDATION_ERROR,
        'Current password and new password are required'
      );
    }

    if (newPassword.length < 6) {
      throw createError(
        ERROR_CODES.WEAK_PASSWORD,
        'New password must be at least 6 characters long'
      );
    }

    await changePassword(req.user.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticateToken, (req, res) => {
  // With JWT, logout is primarily handled client-side by removing tokens
  // This endpoint is mainly for logging/tracking purposes
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

module.exports = router;
