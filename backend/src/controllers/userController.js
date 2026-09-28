const bcrypt = require('bcryptjs');
const pool = require('../config/db');

/**
 * GET /api/users/me
 * Returns current authenticated user profile + quick summary metrics
 */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const u = users[0];

    // User's own sales statistics
    const [salesStats] = await pool.query(
      `SELECT 
        COUNT(*) AS total_sales,
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS total_revenue
       FROM sales 
       WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: Number(u.id),
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.created_at,
        totalSales: Number(salesStats[0]?.total_sales) || 0,
        totalRevenue: Math.round(Number(salesStats[0]?.total_revenue) || 0),
      },
    });
  } catch (err) {
    console.error('[User Profile Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

/**
 * PUT /api/users/me
 * Body: { name, currentPassword, newPassword }
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, currentPassword, newPassword } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }

      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }

      const [users] = await pool.query('SELECT password_hash, password FROM users WHERE id = ? LIMIT 1', [userId]);
      const currentHash = users[0]?.password_hash || users[0]?.password;
      const isMatch = await bcrypt.compare(currentPassword, currentHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.query(
        'UPDATE users SET name = ?, password_hash = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name.trim(), newHash, newHash, userId]
      );
    } else {
      await pool.query(
        'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name.trim(), userId]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: userId,
        name: name.trim(),
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error('[Update Profile Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

/**
 * DELETE /api/users/me
 * Permanently deletes the authenticated user's account and all their sales data.
 */
exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Safety: prevent primary system admin from deleting root admin account
    if (req.user.role === 'admin' && userId === 1) {
      return res.status(400).json({
        success: false,
        message: 'The primary system administrator account cannot be deleted.',
      });
    }

    // 1. Delete associated sales records
    await pool.query('DELETE FROM sales WHERE user_id = ?', [userId]);

    // 2. Delete user account
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    const affected = result?.affectedRows !== undefined ? result.affectedRows : result?.rowCount;
    if (!affected || affected === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    console.log(`[Account Deletion] User #${userId} (${req.user.email}) permanently deleted their account.`);
    return res.status(200).json({
      success: true,
      message: 'Your account and all associated sales records have been permanently deleted.',
    });
  } catch (err) {
    console.error('[Delete Account Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete account. Please try again later.' });
  }
};

