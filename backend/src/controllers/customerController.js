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
      ORDER BY 8 DESC, 7 DESC
    `;

    const [rows] = await pool.query(query, params);

    const customers = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      region: r.region,
      totalOrders: Number(r.totalOrders || 0),
      totalSpending: Number(r.totalSpending || 0),
    }));

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/customers
 * Create a new customer
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, region } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Customer name is required',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Customer email is required',
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : '+91 98765 00000';
    const cleanRegion = region ? region.trim() : 'North';

    // Insert new customer
    const [result] = await pool.query(
      `INSERT INTO customers (name, email, phone, region) VALUES (?, ?, ?, ?) RETURNING id, name, email, phone, region`,
      [cleanName, cleanEmail, cleanPhone, cleanRegion]
    );

    const newCustomer = {
      id: result[0]?.id || Date.now(),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      region: cleanRegion,
      totalOrders: 0,
      totalSpending: 0,
    };

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: newCustomer,
    });
  } catch (error) {
    if (error.code === '23505' || error.message.includes('unique')) {
      return res.status(400).json({
        success: false,
        error: 'A customer with this email address already exists.',
      });
    }
    next(error);
  }
};

/**
 * PUT /api/customers/:id
 * Update an existing customer
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, region } = req.body;

    const [existing] = await pool.query(`SELECT * FROM customers WHERE id = ?`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    const current = existing[0];
    const newName = name !== undefined ? name.trim() : current.name;
    const newEmail = email !== undefined ? email.trim().toLowerCase() : current.email;
    const newPhone = phone !== undefined ? phone.trim() : current.phone;
    const newRegion = region !== undefined ? region.trim() : current.region;

    await pool.query(
      `UPDATE customers SET name = ?, email = ?, phone = ?, region = ? WHERE id = ?`,
      [newName, newEmail, newPhone, newRegion, id]
    );

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: {
        id: Number(id),
        name: newName,
        email: newEmail,
        phone: newPhone,
        region: newRegion,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/customers/:id
 * Delete a customer
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(`SELECT * FROM customers WHERE id = ?`, [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    await pool.query(`DELETE FROM customers WHERE id = ?`, [id]);

    res.status(200).json({
      success: true,
      message: `Customer #${id} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
