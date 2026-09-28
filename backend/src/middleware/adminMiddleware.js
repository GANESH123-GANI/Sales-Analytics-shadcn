/**
 * Admin Authorization Middleware:
 * Must be used AFTER authMiddleware.
 * Ensures the authenticated user has role === 'admin'.
 * Returns 403 Forbidden if user is a normal user.
 */
exports.adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required prior to role verification.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges are required to access this resource.',
    });
  }

  next();
};
