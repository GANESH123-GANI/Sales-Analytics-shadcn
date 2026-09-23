const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ No PostgreSQL connection string found in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function seedUsers() {
  const client = await pool.connect();
  console.log('🔐 Seeding enterprise users into database...');

  try {
    // Ensure table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'sales_manager',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const adminHash = await bcrypt.hash('admin123', 10);
    const managerHash = await bcrypt.hash('manager123', 10);

    // Upsert users
    await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES 
        ('Ganesh Paidi', 'admin@enterprise.com', $1, 'Admin'),
        ('Aditya Rao', 'manager@enterprise.com', $2, 'Sales Manager')
      ON CONFLICT (email) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        role = EXCLUDED.role;
    `, [adminHash, managerHash]);

    const res = await client.query('SELECT id, name, email, role FROM users');
    console.log('✅ Enterprise users successfully seeded:', res.rows);
  } catch (err) {
    console.error('❌ Failed to seed users:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers();
