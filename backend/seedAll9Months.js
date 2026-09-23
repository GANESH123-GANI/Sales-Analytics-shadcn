const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function seed9Months() {
  const client = await pool.connect();
  console.log('🚀 Seeding sales for all 9 months (Jan - Sep 2026)...');

  try {
    await client.query('BEGIN');

    // Additional sales for Apr, May, Jun, Jul, Aug, Sep
    const additionalSales = [
      // More April sales
      { customer_id: 1, date: '2026-04-12', amount: 84500.00, status: 'Completed', region: 'Hyderabad', product_id: 1, qty: 1, price: 64999.00 },
      { customer_id: 3, date: '2026-04-20', amount: 39990.00, status: 'Completed', region: 'Mumbai', product_id: 2, qty: 1, price: 24999.00 },
      { customer_id: 5, date: '2026-04-28', amount: 19999.00, status: 'Completed', region: 'Chennai', product_id: 5, qty: 1, price: 19999.00 },

      // May 2026
      { customer_id: 2, date: '2026-05-04', amount: 49998.00, status: 'Completed', region: 'Bangalore', product_id: 2, qty: 2, price: 24999.00 },
      { customer_id: 4, date: '2026-05-11', amount: 64999.00, status: 'Completed', region: 'Delhi', product_id: 1, qty: 1, price: 64999.00 },
      { customer_id: 6, date: '2026-05-18', amount: 24998.00, status: 'Completed', region: 'Pune', product_id: 11, qty: 2, price: 12499.00 },
      { customer_id: 7, date: '2026-05-25', amount: 15498.00, status: 'Completed', region: 'Mumbai', product_id: 3, qty: 2, price: 7499.00 },

      // June 2026
      { customer_id: 8, date: '2026-06-03', amount: 94998.00, status: 'Completed', region: 'Bangalore', product_id: 1, qty: 1, price: 64999.00 },
      { customer_id: 3, date: '2026-06-10', amount: 59997.00, status: 'Completed', region: 'Mumbai', product_id: 5, qty: 3, price: 19999.00 },
      { customer_id: 1, date: '2026-06-17', amount: 24999.00, status: 'Completed', region: 'Hyderabad', product_id: 2, qty: 1, price: 24999.00 },
      { customer_id: 5, date: '2026-06-24', amount: 37497.00, status: 'Completed', region: 'Chennai', product_id: 11, qty: 3, price: 12499.00 },

      // July 2026
      { customer_id: 2, date: '2026-07-05', amount: 129998.00, status: 'Completed', region: 'Bangalore', product_id: 1, qty: 2, price: 64999.00 },
      { customer_id: 4, date: '2026-07-12', amount: 49998.00, status: 'Completed', region: 'Delhi', product_id: 2, qty: 2, price: 24999.00 },
      { customer_id: 7, date: '2026-07-19', amount: 39998.00, status: 'Completed', region: 'Mumbai', product_id: 5, qty: 2, price: 19999.00 },
      { customer_id: 6, date: '2026-07-26', amount: 19996.00, status: 'Completed', region: 'Pune', product_id: 4, qty: 4, price: 4999.00 },

      // August 2026
      { customer_id: 3, date: '2026-08-04', amount: 142000.00, status: 'Completed', region: 'Mumbai', product_id: 1, qty: 2, price: 64999.00 },
      { customer_id: 8, date: '2026-08-12', amount: 49998.00, status: 'Completed', region: 'Bangalore', product_id: 2, qty: 2, price: 24999.00 },
      { customer_id: 1, date: '2026-08-19', amount: 37497.00, status: 'Completed', region: 'Hyderabad', product_id: 11, qty: 3, price: 12499.00 },
      { customer_id: 5, date: '2026-08-27', amount: 19999.00, status: 'Completed', region: 'Chennai', product_id: 5, qty: 1, price: 19999.00 },

      // September 2026
      { customer_id: 4, date: '2026-09-02', amount: 194997.00, status: 'Completed', region: 'Delhi', product_id: 1, qty: 3, price: 64999.00 },
      { customer_id: 2, date: '2026-09-09', amount: 74997.00, status: 'Completed', region: 'Bangalore', product_id: 2, qty: 3, price: 24999.00 },
      { customer_id: 7, date: '2026-09-15', amount: 59997.00, status: 'Completed', region: 'Mumbai', product_id: 5, qty: 3, price: 19999.00 },
      { customer_id: 6, date: '2026-09-21', amount: 49990.00, status: 'Completed', region: 'Pune', product_id: 4, qty: 10, price: 4999.00 },
    ];

    for (const sale of additionalSales) {
      const res = await client.query(`
        INSERT INTO sales (customer_id, sale_date, total_amount, status, region)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [sale.customer_id, sale.date, sale.amount, sale.status, sale.region]);

      const saleId = res.rows[0].id;

      await client.query(`
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5)
      `, [saleId, sale.product_id, sale.qty, sale.price, sale.amount]);
    }

    await client.query('COMMIT');
    console.log('✅ Successfully seeded sales across all 9 months!');

    const monthlySummary = await client.query(`
      SELECT 
        TO_CHAR(sale_date, 'Mon') AS month,
        EXTRACT(MONTH FROM sale_date) AS month_num,
        COUNT(*) AS orders,
        SUM(total_amount) AS revenue
      FROM sales
      WHERE status != 'Cancelled'
      GROUP BY TO_CHAR(sale_date, 'Mon'), EXTRACT(MONTH FROM sale_date)
      ORDER BY month_num ASC
    `);

    console.log('\n📊 Monthly Revenue Breakdown:');
    console.table(monthlySummary.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to seed 9 months sales:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed9Months();
