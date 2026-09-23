const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function runSetup() {
  console.log('[DB Setup] Connecting to MySQL server...');
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'sales_analytics';

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log('[DB Setup] Connected. Reading schema.sql...');
    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[DB Setup] Executing schema.sql...');
    await connection.query(schemaSql);
    console.log('[DB Setup] Database & tables created successfully.');

    console.log('[DB Setup] Reading seed.sql...');
    const seedPath = path.resolve(__dirname, '../database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('[DB Setup] Executing seed.sql...');
    await connection.query(seedSql);
    console.log('[DB Setup] Seed data inserted successfully!');

    // Verify record counts
    const [sales] = await connection.query('SELECT COUNT(*) as count FROM sales_analytics.sales');
    const [customers] = await connection.query('SELECT COUNT(*) as count FROM sales_analytics.customers');
    const [products] = await connection.query('SELECT COUNT(*) as count FROM sales_analytics.products');

    console.log(`[DB Setup] Status Summary:`);
    console.log(`  - Products:  ${products[0].count}`);
    console.log(`  - Customers: ${customers[0].count}`);
    console.log(`  - Sales:     ${sales[0].count}`);
    console.log('[DB Setup] Database setup complete!');
  } catch (err) {
    console.error('[DB Setup Error]', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runSetup();
