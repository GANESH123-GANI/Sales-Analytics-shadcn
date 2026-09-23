const pool = require('../config/db');

/**
 * GET /api/sales
 * Query params:
 * - search: string (matches customer name, region, or sale id)
 * - status: string ('Completed', 'Pending', 'Cancelled')
 * - limit: number
 */
exports.getSales = async (req, res, next) => {
  try {
    const { search, status, limit = 100 } = req.query;

    let query = `
      SELECT 
        s.id,
        s.customer_id AS customerId,
        c.name AS customerName,
        c.email AS customerEmail,
        DATE_FORMAT(s.sale_date, '%Y-%m-%d') AS saleDate,
        s.total_amount AS amount,
        s.status,
        s.region,
        s.created_at AS createdAt,
        COUNT(si.id) AS itemsCount
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'All') {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      query += ` AND (c.name LIKE ? OR s.region LIKE ? OR CAST(s.id AS CHAR) = ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, search.trim());
    }

    query += `
      GROUP BY s.id, s.customer_id, c.name, c.email, s.sale_date, s.total_amount, s.status, s.region, s.created_at
      ORDER BY s.sale_date DESC, s.id DESC
      LIMIT ?
    `;
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);

    const sales = rows.map(r => ({
      id: r.id,
      customerId: r.customerId,
      customer: r.customerName,
      customerEmail: r.customerEmail,
      date: r.saleDate,
      amount: Number(r.amount),
      status: r.status,
      region: r.region,
      itemsCount: Number(r.itemsCount) || 1
    }));

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    next(error);
  }
};
