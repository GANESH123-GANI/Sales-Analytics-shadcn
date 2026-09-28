const pool = require('../config/db');

/**
 * GET /api/sales
 * Strictly returns only the authenticated user's sales.
 * Query params:
 * - search: string (matches customerName, productName, category, region, or sale id)
 * - status: string ('Completed', 'Pending', 'Cancelled')
 * - limit: number
 */
exports.getSales = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, status, limit = 200 } = req.query;

    let query = `
      SELECT 
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
    `;

    const params = [userId];

    if (status && status !== 'All') {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      query += ` AND (
        s.customer_name LIKE ? OR 
        s.product_name LIKE ? OR 
        s.category LIKE ? OR 
        s.region LIKE ? OR 
        CAST(s.id AS CHAR) = ?
      )`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, search.trim());
    }

    query += `
      ORDER BY s.sale_date DESC, s.id DESC
      LIMIT ?
    `;
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);

    const sales = rows.map((r) => ({
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
    }));

    return res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sales/:id
 * Retrieves a single sale record belonging to the authenticated user.
 */
exports.getSaleById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const saleId = req.params.id;

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
      WHERE s.id = ? AND s.user_id = ?
      LIMIT 1`,
      [saleId, userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sale record not found or access denied.',
      });
    }

    const r = rows[0];
    return res.status(200).json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sales
 * Creates a new sale record for the authenticated user.
 * Backend securely calculates total_amount = quantity * price.
 */
exports.createSale = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      productName,
      category,
      quantity,
      price,
      saleDate,
      region,
      customerName,
      status = 'Completed',
    } = req.body;

    // Validation
    if (!productName || !productName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.',
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number (minimum 1).',
      });
    }

    const unitPrice = parseFloat(price);
    if (isNaN(unitPrice) || unitPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number.',
      });
    }

    // Backend-computed total amount (never trust client-sent total)
    const totalAmount = Number((qty * unitPrice).toFixed(2));

    const cleanCategory = (category || 'General').trim();
    const cleanRegion = (region || 'General').trim();
    const cleanCustomer = (customerName || 'Direct Customer').trim();
    const validStatus = ['Completed', 'Pending', 'Cancelled'].includes(status)
      ? status
      : 'Completed';

    // Format or validate sale date
    let dateVal = saleDate ? new Date(saleDate) : new Date();
    if (isNaN(dateVal.getTime())) {
      dateVal = new Date();
    }
    const formattedDate = dateVal.toISOString().split('T')[0];

    let newSaleId;
    if (pool.isPostgres) {
      const [rows] = await pool.query(
        `INSERT INTO sales (
          user_id,
          product_name,
          category,
          quantity,
          price,
          total_amount,
          sale_date,
          region,
          customer_name,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        [
          userId,
          productName.trim(),
          cleanCategory,
          qty,
          unitPrice,
          totalAmount,
          formattedDate,
          cleanRegion,
          cleanCustomer,
          validStatus,
        ]
      );
      newSaleId = Number(rows[0]?.id);
    } else {
      const [result] = await pool.query(
        `INSERT INTO sales (
          user_id,
          product_name,
          category,
          quantity,
          price,
          total_amount,
          sale_date,
          region,
          customer_name,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          productName.trim(),
          cleanCategory,
          qty,
          unitPrice,
          totalAmount,
          formattedDate,
          cleanRegion,
          cleanCustomer,
          validStatus,
        ]
      );
      newSaleId = Number(result?.insertId);
    }

    return res.status(201).json({
      success: true,
      message: 'Sale record created successfully.',
      data: {
        id: newSaleId,
        userId,
        productName: productName.trim(),
        category: cleanCategory,
        quantity: qty,
        price: unitPrice,
        amount: totalAmount,
        date: formattedDate,
        region: cleanRegion,
        customer: cleanCustomer,
        status: validStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/sales/:id
 * Updates an existing sale record belonging to the authenticated user.
 */
exports.updateSale = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const saleId = req.params.id;

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id, quantity, price FROM sales WHERE id = ? AND user_id = ? LIMIT 1',
      [saleId, userId]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sale record not found or access denied.',
      });
    }

    const current = existing[0];
    const {
      productName,
      category,
      quantity,
      price,
      saleDate,
      region,
      customerName,
      status,
    } = req.body;

    const qty = quantity !== undefined ? parseInt(quantity, 10) : current.quantity;
    const unitPrice = price !== undefined ? parseFloat(price) : Number(current.price);
    const totalAmount = Number((qty * unitPrice).toFixed(2));

    await pool.query(
      `UPDATE sales SET
        product_name = COALESCE(?, product_name),
        category = COALESCE(?, category),
        quantity = ?,
        price = ?,
        total_amount = ?,
        sale_date = COALESCE(?, sale_date),
        region = COALESCE(?, region),
        customer_name = COALESCE(?, customer_name),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`,
      [
        productName ? productName.trim() : null,
        category ? category.trim() : null,
        qty,
        unitPrice,
        totalAmount,
        saleDate || null,
        region ? region.trim() : null,
        customerName ? customerName.trim() : null,
        status || null,
        saleId,
        userId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Sale record updated successfully.',
      data: {
        id: Number(saleId),
        userId,
        amount: totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/sales/:id
 * Deletes a sale record belonging to the authenticated user.
 */
exports.deleteSale = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const saleId = req.params.id;

    // Check & delete
    const [result] = await pool.query(
      'DELETE FROM sales WHERE id = ? AND user_id = ?',
      [saleId, userId]
    );

    const affected = result.affectedRows !== undefined ? result.affectedRows : result.rowCount;

    if (!affected || affected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sale record not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sale record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
