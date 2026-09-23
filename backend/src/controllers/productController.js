const pool = require('../config/db');

/**
 * GET /api/products
 * Query params:
 * - search: string (matches product name or category)
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.category,
        p.price,
        p.stock,
        p.created_at AS createdAt,
        COALESCE(SUM(CASE WHEN s.status != 'Cancelled' THEN si.quantity ELSE 0 END), 0) AS unitsSold,
        COALESCE(SUM(CASE WHEN s.status != 'Cancelled' THEN si.total_price ELSE 0 END), 0) AS revenue
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (search && search.trim() !== '') {
      query += ` AND (p.name LIKE ? OR p.category LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern);
    }

    query += `
      GROUP BY p.id, p.name, p.category, p.price, p.stock, p.created_at
      ORDER BY revenue DESC, p.name ASC
    `;

    const [rows] = await pool.query(query, params);

    const products = rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      price: Number(r.price),
      stock: Number(r.stock),
      unitsSold: Number(r.unitsSold),
      revenue: Number(r.revenue)
    }));

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
