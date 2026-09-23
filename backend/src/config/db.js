const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables reliably from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

const poolConfig = dbUrl
  ? {
      uri: dbUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
      ssl: process.env.DB_SSL === 'false' ? undefined : (process.env.DB_SSL === 'true' || dbUrl.includes('ssl') ? { rejectUnauthorized: false } : undefined)
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sales_analytics',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    };

const pool = mysql.createPool(poolConfig);

// Test connection on boot
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL database "${process.env.DB_NAME || 'sales_analytics'}" at ${process.env.DB_HOST || 'localhost'}`);
    connection.release();
  } catch (error) {
    console.error('[Database] Initial connection error:', error.message);
    console.error('[Database] Verify that MySQL is running and credentials in backend/.env are correct.');
  }
})();

module.exports = pool;
