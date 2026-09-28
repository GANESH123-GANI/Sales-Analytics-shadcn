const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'sales_analytics_enterprise_jwt_secret_2026';

/**
 * Authentication Middleware:
 * 1. Reads 'Authorization: Bearer <token>' header
 * 2. Verifies JWT signature and expiry
 * 3. Fetches user from DB to ensure user exists and account is active
 * 4. Attaches authenticated user object to req.user (id, name, email, role)
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Authorization token is missing.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token.',
      });
    }

    // Retrieve fresh user state from database
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        accountStatus: 'deleted',
        message: 'Your account has been deleted or removed by an administrator. Please contact your system administrator.',
      });
    }

    const dbUser = rows[0];

    // Check account status
    if (dbUser.status === 'inactive') {
      return res.status(403).json({
        success: false,
        accountStatus: 'inactive',
        message: 'Your account has been deactivated by an administrator. Please contact your system administrator to restore access.',
      });
    }

    // Attach authenticated identity securely to req.user
    req.user = {
      id: Number(dbUser.id),
      name: dbUser.name,
      email: dbUser.email,
      role: (dbUser.role || 'user').toLowerCase(),
    };

    next();
  } catch (error) {
    console.error('[authMiddleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying authentication.',
    });
  }
};
