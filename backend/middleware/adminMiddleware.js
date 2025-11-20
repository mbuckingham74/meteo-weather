const { verifyAccessToken } = require('../services/authService');
const { pool } = require('../config/database');

/**
 * Admin Authentication Middleware
 * Protects admin routes by verifying user is an admin
 */

/**
 * Admin-only authentication middleware
 * Checks if user is authenticated and has admin role
 */
async function requireAdmin(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Cross-check admin status against the database to avoid stale or forged claims
    const [users] = await pool.query(
      'SELECT id, email, is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. User not found.'
      });
    }

    const user = users[0];

    // Attach user info to request
    req.user = {
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin || false
    };

    // Check if user is admin (verified against DB)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

module.exports = {
  requireAdmin
};
