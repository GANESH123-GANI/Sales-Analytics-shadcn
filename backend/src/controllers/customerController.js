const pool = require('../config/db');

/**
 * GET /api/customers
 * Query params:
 * - search: string (matches customer name, email, or region)
 */
exports.getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.region,
        c.created_at AS createdAt,
        COUNT(s.id) AS totalOrders,
        COALESCE(SUM(CASE WHEN s.status != 'Cancelled' THEN s.total_amount ELSE 0 END), 0) AS totalSpending
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      WHERE 1=1
    `;

    const params = [];

    if (search && search.trim() !== '') {
      query += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.region LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += `
      GROUP BY c.id, c.name, c.email, c.phone, c.region, c.created_at
      ORDER BY totalSpending DESC, totalOrders DESC
    `;

    const [rows] = await pool.query(query, params);

    const customers = rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      region: r.region,
      totalOrders: Number(r.totalOrders),
      totalSpending: Number(r.totalSpending)
    }));

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};
