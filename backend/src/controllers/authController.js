const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'sales_analytics_enterprise_jwt_secret_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Helper to generate signed JWT for authenticated user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: (user.role || 'user').toLowerCase(),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/register
 * Body: { name, email, password, confirmPassword }
 * Assigns role = 'user' and status = 'active' by default.
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Validation: Required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
      });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // 3. Password confirmation & length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // 4. Duplicate email prevention
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1',
      [cleanEmail]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 5. Secure password hashing with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 6. Role & Status assignment (Always 'user' and 'active')
    const role = 'user';
    const status = 'active';
    const cleanName = name.trim();

    await pool.query(
      'INSERT INTO users (name, email, password_hash, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [cleanName, cleanEmail, passwordHash, passwordHash, role, status]
    );

    // Fetch the newly created record reliably across both MySQL and PostgreSQL
    const [uRows] = await pool.query(
      'SELECT id, name, email, role, status FROM users WHERE LOWER(email) = ? LIMIT 1',
      [cleanEmail]
    );

    const newUser = uRows[0];
    const newUserId = Number(newUser.id);

    // 7. Generate JWT
    const token = generateToken({
      id: newUserId,
      name: cleanName,
      email: cleanEmail,
      role,
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUserId,
        name: cleanName,
        email: cleanEmail,
        role,
        status,
      },
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration due to a server error.',
    });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user by email
    const [users] = await pool.query(
      'SELECT id, name, email, password, password_hash, role, status FROM users WHERE LOWER(email) = ? LIMIT 1',
      [cleanEmail]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = users[0];

    // Check account status
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        accountStatus: 'inactive',
        message: 'Your account has been deactivated by an administrator. Please contact your system administrator to restore access.',
      });
    }

    // Verify password with bcrypt
    const hash = user.password_hash || user.password;
    const isMatch = await bcrypt.compare(password, hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const normalizedRole = (user.role || 'user').toLowerCase();

    // Generate JWT
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: normalizedRole,
        status: user.status || 'active',
      },
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Verified via authMiddleware
 */
exports.getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const user = rows[0];
    return res.status(200).json({
      success: true,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: (user.role || 'user').toLowerCase(),
        status: user.status,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile information.',
    });
  }
};

/**
 * POST /api/auth/admin-login
 * Body: { email, password }
 * Strictly verifies role === 'admin'
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user by email
    const [users] = await pool.query(
      'SELECT id, name, email, password, password_hash, role, status FROM users WHERE LOWER(email) = ? LIMIT 1',
      [cleanEmail]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    const user = users[0];

    // Check account status
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        accountStatus: 'inactive',
        message: 'This administrator account has been deactivated.',
      });
    }

    // Verify password with bcrypt
    const hash = user.password_hash || user.password;
    const isMatch = await bcrypt.compare(password, hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    const normalizedRole = (user.role || 'user').toLowerCase();

    // Strictly ensure role is admin
    if (normalizedRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Administrator privileges required to enter this portal. Standard user accounts cannot log in here.',
      });
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'admin',
    });

    return res.status(200).json({
      success: true,
      message: 'Administrator authentication successful.',
      token,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: 'admin',
        status: user.status || 'active',
      },
    });
  } catch (err) {
    console.error('[Admin Auth Login Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during administrator authentication.',
    });
  }
};

