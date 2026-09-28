const pool = require('../config/db');

/**
 * GET /api/dashboard/summary & /api/analytics/summary
 * Returns: totalRevenue, totalOrders, totalCustomers, averageOrderValue
 * Filtered by authenticated user's ID (req.user.id)
 */
exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [revResult] = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS totalRevenue,
        COUNT(*) AS totalOrders,
        COALESCE(AVG(CASE WHEN status != 'Cancelled' THEN total_amount ELSE NULL END), 0) AS averageOrderValue,
        COUNT(DISTINCT customer_name) AS totalCustomers
      FROM sales
      WHERE user_id = ?`,
      [userId]
    );

    const totalRevenue = Math.round(Number(revResult[0]?.totalRevenue) || 0);
    const totalOrders = Number(revResult[0]?.totalOrders) || 0;
    const averageOrderValue = Math.round(Number(revResult[0]?.averageOrderValue) || 0);
    const totalCustomers = Number(revResult[0]?.totalCustomers) || 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        averageOrderValue,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/monthly-revenue & /api/analytics/monthly
 * Returns monthly revenue list for Line Chart
 */
exports.getMonthlyRevenue = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        DATE_FORMAT(sale_date, '%b') AS month,
        MONTH(sale_date) AS monthNum,
        ROUND(COALESCE(SUM(total_amount), 0), 2) AS revenue
      FROM sales
      WHERE user_id = ? AND status != 'Cancelled'
      GROUP BY DATE_FORMAT(sale_date, '%b'), MONTH(sale_date)
      ORDER BY 2 ASC`,
      [userId]
    );

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueMap = {};

    rows.forEach((r) => {
      const cleanMonth = (r.month || '').trim().substring(0, 3);
      revenueMap[cleanMonth] = Number(r.revenue) || 0;
    });

    const result = MONTHS.slice(0, 9).map((m) => ({
      month: m,
      revenue: revenueMap[m] || 0,
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/category-sales & /api/analytics/categories
 * Returns sales grouped by category for Bar Chart
 */
exports.getCategorySales = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        COALESCE(category, 'General') AS category,
        ROUND(COALESCE(SUM(total_amount), 0), 2) AS sales
      FROM sales
      WHERE user_id = ? AND status != 'Cancelled'
      GROUP BY category
      ORDER BY sales DESC`,
      [userId]
    );

    const result = rows.map((r) => ({
      category: r.category,
      sales: Number(r.sales) || 0,
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/region-sales & /api/analytics/regions
 * Returns sales grouped by region for Bar Chart
 */
exports.getRegionSales = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        COALESCE(region, 'General') AS region,
        ROUND(COALESCE(SUM(total_amount), 0), 2) AS sales
      FROM sales
      WHERE user_id = ? AND status != 'Cancelled'
      GROUP BY region
      ORDER BY sales DESC`,
      [userId]
    );

    const result = rows.map((r) => ({
      region: r.region,
      sales: Number(r.sales) || 0,
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/products
 * Returns products sales for product analytics
 */
exports.getProductSales = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        COALESCE(product_name, 'Standard Product') AS name,
        COALESCE(category, 'General') AS category,
        SUM(quantity) AS unitsSold,
        ROUND(SUM(total_amount), 2) AS revenue
      FROM sales
      WHERE user_id = ? AND status != 'Cancelled'
      GROUP BY product_name, category
      ORDER BY revenue DESC`,
      [userId]
    );

    const result = rows.map((r) => ({
      name: r.name,
      category: r.category,
      unitsSold: Number(r.unitsSold) || 0,
      revenue: Number(r.revenue) || 0,
    }));

    res.status(200).json({
      success: true,
      data: result,
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
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        status,
        COUNT(*) AS count
      FROM sales
      WHERE user_id = ?
      GROUP BY status`,
      [userId]
    );

    const counts = {
      Completed: 0,
      Pending: 0,
      Cancelled: 0,
    };

    rows.forEach((r) => {
      if (counts.hasOwnProperty(r.status)) {
        counts[r.status] = Number(r.count);
      }
    });

    const list = [
      { status: 'Completed', count: counts.Completed },
      { status: 'Pending', count: counts.Pending },
      { status: 'Cancelled', count: counts.Cancelled },
    ];

    res.status(200).json({
      success: true,
      data: {
        summary: counts,
        list,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/all
 * Combined high-performance single-trip dashboard loader
 * Strictly filtered by req.user.id
 */
exports.getDashboardAll = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      [revResult],
      [monthlyRows],
      [catRows],
      [regionRows],
      [statusRows],
    ] = await Promise.all([
      pool.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS totalRevenue,
          COUNT(*) AS totalOrders,
          COALESCE(AVG(CASE WHEN status != 'Cancelled' THEN total_amount ELSE NULL END), 0) AS averageOrderValue,
          COUNT(DISTINCT customer_name) AS totalCustomers
        FROM sales
        WHERE user_id = ?`,
        [userId]
      ),
      pool.query(
        `SELECT 
          DATE_FORMAT(sale_date, '%b') AS month,
          MONTH(sale_date) AS monthNum,
          ROUND(COALESCE(SUM(total_amount), 0), 2) AS revenue
        FROM sales
        WHERE user_id = ? AND status != 'Cancelled'
        GROUP BY DATE_FORMAT(sale_date, '%b'), MONTH(sale_date)
        ORDER BY 2 ASC`,
        [userId]
      ),
      pool.query(
        `SELECT 
          COALESCE(category, 'General') AS category,
          ROUND(COALESCE(SUM(total_amount), 0), 2) AS sales
        FROM sales
        WHERE user_id = ? AND status != 'Cancelled'
        GROUP BY category
        ORDER BY sales DESC`,
        [userId]
      ),
      pool.query(
        `SELECT 
          COALESCE(region, 'General') AS region,
          ROUND(COALESCE(SUM(total_amount), 0), 2) AS sales
        FROM sales
        WHERE user_id = ? AND status != 'Cancelled'
        GROUP BY region
        ORDER BY sales DESC`,
        [userId]
      ),
      pool.query(
        `SELECT status, COUNT(*) AS count
        FROM sales
        WHERE user_id = ?
        GROUP BY status`,
        [userId]
      ),
    ]);

    const summary = {
      totalRevenue: Math.round(Number(revResult[0]?.totalRevenue) || 0),
      totalOrders: Number(revResult[0]?.totalOrders) || 0,
      totalCustomers: Number(revResult[0]?.totalCustomers) || 0,
      averageOrderValue: Math.round(Number(revResult[0]?.averageOrderValue) || 0),
    };

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const revenueMap = {};
    monthlyRows.forEach((r) => {
      const cleanMonth = (r.month || '').trim().substring(0, 3);
      revenueMap[cleanMonth] = Number(r.revenue) || 0;
    });

    const monthlyRevenue = MONTHS.map((m) => ({
      month: m,
      revenue: revenueMap[m] || 0,
    }));

    const categorySales = catRows.map((r) => ({
      category: r.category,
      sales: Number(r.sales) || 0,
    }));

    const regionSales = regionRows.map((r) => ({
      region: r.region,
      sales: Number(r.sales) || 0,
    }));

    const statusCounts = { Completed: 0, Pending: 0, Cancelled: 0 };
    statusRows.forEach((row) => {
      if (statusCounts[row.status] !== undefined) {
        statusCounts[row.status] = Number(row.count);
      }
    });

    const orderStatus = {
      summary: statusCounts,
      list: [
        { status: 'Completed', count: statusCounts.Completed },
        { status: 'Pending', count: statusCounts.Pending },
        { status: 'Cancelled', count: statusCounts.Cancelled },
      ],
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        monthlyRevenue,
        categorySales,
        regionSales,
        orderStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports
 * Returns executive reporting for authenticated user's data
 */
exports.getReports = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. User Summary
    const [summary] = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) AS totalRevenue,
        COUNT(*) AS totalOrders
      FROM sales
      WHERE user_id = ?`,
      [userId]
    );

    // 2. Top Category
    const [topCat] = await pool.query(
      `SELECT category, ROUND(SUM(total_amount), 2) AS revenue
      FROM sales
      WHERE user_id = ? AND status != 'Cancelled'
      GROUP BY category
      ORDER BY revenue DESC
      LIMIT 1`,
      [userId]
    );

    // 3. Top Region
    const [topReg] = await pool.query(
      `SELECT region, ROUND(SUM(total_amount), 2) AS revenue
      FROM sales
      WHERE user_id = ? AND status != 'Cancelled'
      GROUP BY region
      ORDER BY revenue DESC
      LIMIT 1`,
      [userId]
    );

    // 4. Top Product
    const [topProd] = await pool.query(
      `SELECT product_name AS name, ROUND(SUM(total_amount), 2) AS revenue, SUM(quantity) AS units
      FROM sales
      WHERE user_id = ? AND status != 'Cancelled'
      GROUP BY product_name
      ORDER BY revenue DESC
      LIMIT 1`,
      [userId]
    );

    // 5. Regional Summary Table
    const [tableRows] = await pool.query(
      `SELECT 
        region,
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_orders,
        ROUND(COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0), 2) AS total_revenue
      FROM sales
      WHERE user_id = ?
      GROUP BY region
      ORDER BY total_revenue DESC`,
      [userId]
    );

    const totalRevenue = Math.round(Number(summary[0]?.totalRevenue) || 0);
    const totalOrders = Number(summary[0]?.totalOrders) || 0;
    const estCOGS = Math.round(totalRevenue * 0.316);
    const grossProfit = totalRevenue - estCOGS;
    const totalOpEx = Math.round(totalRevenue * 0.22);
    const netOperatingIncome = grossProfit - totalOpEx;
    const netMarginPercent = ((netOperatingIncome / (totalRevenue || 1)) * 100).toFixed(1);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        topCategory: topCat[0] ? topCat[0].category : 'N/A',
        topRegion: topReg[0] ? topReg[0].region : 'N/A',
        topProduct: topProd[0] ? topProd[0].name : 'N/A',
        topProductRevenue: topProd[0] ? Number(topProd[0].revenue) : 0,
        summaryTable: tableRows.map((r) => ({
          region: r.region,
          totalOrders: Number(r.total_orders) || 0,
          completedOrders: Number(r.completed_orders) || 0,
          totalRevenue: Number(r.total_revenue) || 0,
        })),
        financialMetrics: {
          grossRevenue: totalRevenue,
          cogs: estCOGS,
          grossProfit,
          grossMarginPercent: '68.4%',
          operatingExpenses: totalOpEx,
          netOperatingIncome,
          netMarginPercent: `${netMarginPercent}%`,
          collectionsRate: '95.7%',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
