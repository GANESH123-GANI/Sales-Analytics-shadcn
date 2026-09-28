const pool = require('../config/db');

/**
 * GET /api/admin/dashboard
 * Platform-wide executive statistics for administrators.
 */
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [
      [userStats],
      [salesStats],
      recentUsers,
    ] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) AS totalUsers,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeUsers,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactiveUsers,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS adminCount,
          SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) AS normalUserCount
        FROM users
      `),
      pool.query(`
        SELECT 
          COUNT(*) AS totalSales,
          COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS totalRevenue,
          COALESCE(AVG(CASE WHEN status != 'Cancelled' THEN total_amount ELSE NULL END), 0) AS averageOrderValue
        FROM sales
      `),
      pool.query(`
        SELECT id, name, email, role, status, created_at AS createdAt
        FROM users
        ORDER BY id DESC
        LIMIT 5
      `),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: Number(userStats[0]?.totalUsers) || 0,
        activeUsers: Number(userStats[0]?.activeUsers) || 0,
        inactiveUsers: Number(userStats[0]?.inactiveUsers) || 0,
        adminCount: Number(userStats[0]?.adminCount) || 0,
        normalUserCount: Number(userStats[0]?.normalUserCount) || 0,
        totalSales: Number(salesStats[0]?.totalSales) || 0,
        totalRevenue: Math.round(Number(salesStats[0]?.totalRevenue) || 0),
        averageOrderValue: Math.round(Number(salesStats[0]?.averageOrderValue) || 0),
        recentUsers: (recentUsers[0] || []).map((u) => ({
          id: Number(u.id),
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          createdAt: u.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Lists users with search, role/status filtering, and sales aggregate.
 * NEVER returns password or password_hash.
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.created_at AS createdAt,
        COUNT(s.id) AS salesCount,
        COALESCE(SUM(CASE WHEN s.status != 'Cancelled' THEN s.total_amount ELSE 0 END), 0) AS totalRevenue
      FROM users u
      LEFT JOIN sales s ON u.id = s.user_id
      WHERE 1=1
    `;

    const params = [];

    if (role && role !== 'All') {
      query += ` AND LOWER(u.role) = LOWER(?)`;
      params.push(role);
    }

    if (status && status !== 'All') {
      query += ` AND LOWER(u.status) = LOWER(?)`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR CAST(u.id AS CHAR) = ?)`;
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, search.trim());
    }

    query += `
      GROUP BY u.id, u.name, u.email, u.role, u.status, u.created_at
      ORDER BY u.id ASC
    `;

    const [rows] = await pool.query(query, params);

    const users = rows.map((u) => ({
      id: Number(u.id),
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status || 'active',
      createdAt: u.createdAt,
      salesCount: Number(u.salesCount) || 0,
      totalRevenue: Math.round(Number(u.totalRevenue) || 0),
    }));

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id
 * Single user details with summary metrics.
 */
exports.getUserById = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    const [rows] = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.created_at AS createdAt,
        COUNT(s.id) AS salesCount,
        COALESCE(SUM(CASE WHEN s.status != 'Cancelled' THEN s.total_amount ELSE 0 END), 0) AS totalRevenue
      FROM users u
      LEFT JOIN sales s ON u.id = s.user_id
      WHERE u.id = ?
      GROUP BY u.id, u.name, u.email, u.role, u.status, u.created_at
      LIMIT 1`,
      [targetUserId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const u = rows[0];
    return res.status(200).json({
      success: true,
      data: {
        id: Number(u.id),
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status || 'active',
        createdAt: u.createdAt,
        salesCount: Number(u.salesCount) || 0,
        totalRevenue: Math.round(Number(u.totalRevenue) || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Activate or deactivate a user account.
 * Body: { status: 'active' | 'inactive' }
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'active' or 'inactive'.",
      });
    }

    // Safety: prevent admin from deactivating themselves
    if (targetUserId === req.user.id && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.',
      });
    }

    const [result] = await pool.query(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, targetUserId]
    );

    const affected = result.affectedRows !== undefined ? result.affectedRows : result.rowCount;
    if (!affected || affected === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User status successfully updated to ${status}.`,
      data: {
        id: targetUserId,
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id/sales
 * View sales records belonging to a specific user.
 */
exports.getUserSales = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    const [rows] = await pool.query(
      `SELECT 
        s.id,
        s.user_id AS userId,
        COALESCE(s.customer_name, 'Direct Customer') AS customer,
        COALESCE(s.product_name, 'Standard Product') AS productName,
        COALESCE(s.category, 'General') AS category,
        COALESCE(s.quantity, 1) AS quantity,
        COALESCE(s.price, s.total_amount) AS price,
        DATE_FORMAT(s.sale_date, '%Y-%m-%d') AS date,
        s.total_amount AS amount,
        s.status,
        s.region,
        s.created_at AS createdAt
      FROM sales s
      WHERE s.user_id = ?
      ORDER BY s.sale_date DESC, s.id DESC`,
      [targetUserId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows.map((r) => ({
        id: Number(r.id),
        userId: Number(r.userId),
        customer: r.customer,
        productName: r.productName,
        category: r.category,
        quantity: Number(r.quantity) || 1,
        price: Number(r.price) || 0,
        date: r.date,
        amount: Number(r.amount) || 0,
        status: r.status,
        region: r.region,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id/analytics
 * View analytics breakdown for a specific user.
 */
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    const [
      [revResult],
      [monthlyRows],
      [catRows],
      [regionRows],
    ] = await Promise.all([
      pool.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS totalRevenue,
          COUNT(*) AS totalOrders,
          COALESCE(AVG(CASE WHEN status != 'Cancelled' THEN total_amount ELSE NULL END), 0) AS averageOrderValue
        FROM sales
        WHERE user_id = ?`,
        [targetUserId]
      ),
      pool.query(
        `SELECT 
          DATE_FORMAT(sale_date, '%b') AS month,
          ROUND(COALESCE(SUM(total_amount), 0), 2) AS revenue
        FROM sales
        WHERE user_id = ? AND status != 'Cancelled'
        GROUP BY DATE_FORMAT(sale_date, '%b'), MONTH(sale_date)
        ORDER BY MONTH(sale_date) ASC`,
        [targetUserId]
      ),
      pool.query(
        `SELECT 
          COALESCE(category, 'General') AS category,
          ROUND(COALESCE(SUM(total_amount), 0), 2) AS sales
        FROM sales
        WHERE user_id = ? AND status != 'Cancelled'
        GROUP BY category
        ORDER BY sales DESC`,
        [targetUserId]
      ),
      pool.query(
        `SELECT 
          COALESCE(region, 'General') AS region,
          ROUND(COALESCE(SUM(total_amount), 0), 2) AS sales
        FROM sales
        WHERE user_id = ? AND status != 'Cancelled'
        GROUP BY region
        ORDER BY sales DESC`,
        [targetUserId]
      ),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: Math.round(Number(revResult[0]?.totalRevenue) || 0),
          totalOrders: Number(revResult[0]?.totalOrders) || 0,
          averageOrderValue: Math.round(Number(revResult[0]?.averageOrderValue) || 0),
        },
        monthlyRevenue: monthlyRows.map((r) => ({
          month: r.month,
          revenue: Number(r.revenue) || 0,
        })),
        categorySales: catRows.map((r) => ({
          category: r.category,
          sales: Number(r.sales) || 0,
        })),
        regionSales: regionRows.map((r) => ({
          region: r.region,
          sales: Number(r.sales) || 0,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user and their associated sales data.
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);

    if (targetUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account from here.',
      });
    }

    // 1. Delete associated sales records
    await pool.query('DELETE FROM sales WHERE user_id = ?', [targetUserId]);

    // 2. Delete user account
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [targetUserId]);

    const affected = result?.affectedRows !== undefined ? result.affectedRows : result?.rowCount;
    if (!affected || affected === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    console.log(`[Admin Action] User #${targetUserId} deleted by Admin #${req.user.id}`);
    return res.status(200).json({
      success: true,
      message: `User account #${targetUserId} and all associated data have been permanently deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

