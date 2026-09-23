const pool = require('../config/db');

/**
 * GET /api/dashboard/summary
 * Returns: totalRevenue, totalOrders, totalCustomers, averageOrderValue
 */
exports.getSummary = async (req, res, next) => {
  try {
    // 1. Total revenue & completed orders count
    const [revResult] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS totalRevenue,
        COUNT(*) AS totalOrders,
        COALESCE(AVG(CASE WHEN status != 'Cancelled' THEN total_amount ELSE NULL END), 0) AS averageOrderValue
      FROM sales
    `);

    // 2. Total customers count
    const [custResult] = await pool.query(`
      SELECT COUNT(*) AS totalCustomers FROM customers
    `);

    const totalRevenue = Math.round(Number(revResult[0].totalRevenue) || 0);
    const totalOrders = Number(revResult[0].totalOrders) || 0;
    const averageOrderValue = Math.round(Number(revResult[0].averageOrderValue) || 0);
    const totalCustomers = Number(custResult[0].totalCustomers) || 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        averageOrderValue
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/monthly-revenue
 * Returns monthly revenue list for Line Chart
 * Example: [{ month: "Jan", revenue: 45000 }, ...]
 */
exports.getMonthlyRevenue = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(sale_date, '%b') AS month,
        MONTH(sale_date) AS monthNum,
        ROUND(COALESCE(SUM(total_amount), 0), 2) AS revenue
      FROM sales
      WHERE status != 'Cancelled'
      GROUP BY DATE_FORMAT(sale_date, '%b'), MONTH(sale_date)
      ORDER BY monthNum ASC
    `);

    const result = rows.map(r => ({
      month: r.month,
      revenue: Number(r.revenue)
    }));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/category-sales
 * Returns sales grouped by product category for Bar Chart
 * Example: [{ category: "Electronics", sales: 85000 }, ...]
 */
exports.getCategorySales = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.category AS category,
        ROUND(COALESCE(SUM(si.total_price), 0), 2) AS sales
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status != 'Cancelled'
      GROUP BY p.category
      ORDER BY sales DESC
    `);

    const result = rows.map(r => ({
      category: r.category,
      sales: Number(r.sales)
    }));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/region-sales
 * Returns sales grouped by geographic region for Bar Chart
 * Example: [{ region: "Hyderabad", sales: 55000 }, ...]
 */
exports.getRegionSales = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        region,
        ROUND(COALESCE(SUM(total_amount), 0), 2) AS sales
      FROM sales
      WHERE status != 'Cancelled'
      GROUP BY region
      ORDER BY sales DESC
    `);

    const result = rows.map(r => ({
      region: r.region,
      sales: Number(r.sales)
    }));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/order-status
 * Returns Completed, Pending, Cancelled counts for Pie/Donut Chart
 */
exports.getOrderStatus = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        status,
        COUNT(*) AS count
      FROM sales
      GROUP BY status
    `);

    const counts = {
      Completed: 0,
      Pending: 0,
      Cancelled: 0
    };

    rows.forEach(r => {
      if (counts.hasOwnProperty(r.status)) {
        counts[r.status] = Number(r.count);
      }
    });

    const list = [
      { status: 'Completed', count: counts.Completed },
      { status: 'Pending', count: counts.Pending },
      { status: 'Cancelled', count: counts.Cancelled }
    ];

    res.status(200).json({
      success: true,
      data: {
        summary: counts,
        list
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports
 * Returns executive report analytics:
 * Total Revenue, Total Orders, Top Category, Top Region, Top Product, Summary Table
 */
exports.getReports = async (req, res, next) => {
  try {
    // 1. Overall Revenue & Orders
    const [summary] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS totalRevenue,
        COUNT(*) AS totalOrders
      FROM sales
    `);

    // 2. Top Category
    const [topCat] = await pool.query(`
      SELECT p.category, ROUND(SUM(si.total_price), 2) AS revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status != 'Cancelled'
      GROUP BY p.category
      ORDER BY revenue DESC
      LIMIT 1
    `);

    // 3. Top Region
    const [topReg] = await pool.query(`
      SELECT region, ROUND(SUM(total_amount), 2) AS revenue
      FROM sales
      WHERE status != 'Cancelled'
      GROUP BY region
      ORDER BY revenue DESC
      LIMIT 1
    `);

    // 4. Top Product
    const [topProd] = await pool.query(`
      SELECT p.name, ROUND(SUM(si.total_price), 2) AS revenue, SUM(si.quantity) AS units
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status != 'Cancelled'
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 1
    `);

    // 5. Summary Table Data: Regional breakdown with orders, completed orders, and revenue
    const [tableRows] = await pool.query(`
      SELECT 
        region,
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_orders,
        ROUND(COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0), 2) AS total_revenue
      FROM sales
      GROUP BY region
      ORDER BY total_revenue DESC
    `);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(Number(summary[0].totalRevenue) || 0),
        totalOrders: Number(summary[0].totalOrders) || 0,
        topCategory: topCat[0] ? topCat[0].category : 'N/A',
        topRegion: topReg[0] ? topReg[0].region : 'N/A',
        topProduct: topProd[0] ? topProd[0].name : 'N/A',
        topProductRevenue: topProd[0] ? Number(topProd[0].revenue) : 0,
        summaryTable: tableRows.map(r => ({
          region: r.region,
          totalOrders: Number(r.total_orders),
          completedOrders: Number(r.completed_orders),
          totalRevenue: Number(r.total_revenue)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/all
 * Ultra-fast single-trip endpoint combining summary, monthly revenue,
 * category sales, region sales, and order status concurrently.
 */
exports.getDashboardAll = async (req, res, next) => {
  try {
    const [
      [revResult],
      [custResult],
      [monthlyRows],
      [catRows],
      [regionRows],
      [statusRows]
    ] = await Promise.all([
      pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS totalRevenue,
          COUNT(*) AS totalOrders,
          COALESCE(AVG(CASE WHEN status != 'Cancelled' THEN total_amount ELSE NULL END), 0) AS averageOrderValue
        FROM sales
      `),
      pool.query(`SELECT COUNT(*) AS totalCustomers FROM customers`),
      pool.query(`
        SELECT 
          DATE_FORMAT(sale_date, '%b') AS month,
          MONTH(sale_date) AS monthNum,
          ROUND(COALESCE(SUM(total_amount), 0), 2) AS revenue
        FROM sales
        WHERE status != 'Cancelled'
        GROUP BY DATE_FORMAT(sale_date, '%b'), MONTH(sale_date)
        ORDER BY monthNum ASC
      `),
      pool.query(`
        SELECT 
          p.category AS category,
          ROUND(COALESCE(SUM(si.total_price), 0), 2) AS sales
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.status != 'Cancelled'
        GROUP BY p.category
        ORDER BY sales DESC
      `),
      pool.query(`
        SELECT 
          region,
          ROUND(COALESCE(SUM(total_amount), 0), 2) AS sales
        FROM sales
        WHERE status != 'Cancelled'
        GROUP BY region
        ORDER BY sales DESC
      `),
      pool.query(`
        SELECT status, COUNT(*) AS count
        FROM sales
        GROUP BY status
      `)
    ]);

    const summary = {
      totalRevenue: Math.round(Number(revResult[0].totalRevenue) || 0),
      totalOrders: Number(revResult[0].totalOrders) || 0,
      totalCustomers: Number(custResult[0].totalCustomers) || 0,
      averageOrderValue: Math.round(Number(revResult[0].averageOrderValue) || 0)
    };

    const monthlyRevenue = monthlyRows.map(r => ({
      month: r.month,
      revenue: Number(r.revenue)
    }));

    const categorySales = catRows.map(r => ({
      category: r.category,
      sales: Number(r.sales)
    }));

    const regionSales = regionRows.map(r => ({
      region: r.region,
      sales: Number(r.sales)
    }));

    const statusCounts = { Completed: 0, Pending: 0, Cancelled: 0 };
    statusRows.forEach(row => {
      if (statusCounts[row.status] !== undefined) {
        statusCounts[row.status] = Number(row.count);
      }
    });

    const orderStatus = {
      summary: statusCounts,
      list: [
        { status: 'Completed', count: statusCounts.Completed },
        { status: 'Pending', count: statusCounts.Pending },
        { status: 'Cancelled', count: statusCounts.Cancelled }
      ]
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        monthlyRevenue,
        categorySales,
        regionSales,
        orderStatus
      }
    });
  } catch (error) {
    next(error);
  }
};
