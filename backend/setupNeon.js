const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('\n❌ ERROR: No PostgreSQL / Neon connection string found in .env!');
  console.error('Please add your Neon connection string to backend/.env:');
  console.error('DATABASE_URL=postgresql://username:password@ep-xyz.aws.neon.tech/neondb?sslmode=require\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function setupNeon() {
  const client = await pool.connect();
  console.log('\n🚀 Connected to Neon PostgreSQL! Setting up schema & seeding data...');

  try {
    await client.query('BEGIN');

    // 1. Drop existing tables if needed
    console.log('📦 Recreating tables...');
    await client.query(`
      DROP TABLE IF EXISTS enterprise_contracts CASCADE;
      DROP TABLE IF EXISTS executive_reviews CASCADE;
      DROP TABLE IF EXISTS operating_expenses CASCADE;
      DROP TABLE IF EXISTS sale_items CASCADE;
      DROP TABLE IF EXISTS sales CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // 2. Create Users Table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'sales_manager',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Products Table
    await client.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_product_category ON products(category);
    `);

    // 4. Create Customers Table
    await client.query(`
      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(20),
        region VARCHAR(80) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_customer_region ON customers(region);
    `);

    // 5. Create Sales Table
    await client.query(`
      CREATE TABLE sales (
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        sale_date DATE NOT NULL,
        total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        status VARCHAR(20) NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Pending', 'Cancelled')),
        region VARCHAR(80) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_sales_date ON sales(sale_date);
      CREATE INDEX idx_sales_region ON sales(region);
      CREATE INDEX idx_sales_status ON sales(status);
    `);

    // 6. Create Sale Items Table
    await client.query(`
      CREATE TABLE sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        quantity INT NOT NULL,
        unit_price NUMERIC(10, 2) NOT NULL,
        total_price NUMERIC(12, 2) NOT NULL
      );
      CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
      CREATE INDEX idx_sale_items_product ON sale_items(product_id);
    `);

    // 7. Create Operating Expenses Table
    await client.query(`
      CREATE TABLE operating_expenses (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        budgeted_amount NUMERIC(12, 2) NOT NULL,
        variance NUMERIC(12, 2) NOT NULL,
        quarter VARCHAR(20) NOT NULL
      );
    `);

    // 8. Create Executive Reviews Table
    await client.query(`
      CREATE TABLE executive_reviews (
        id SERIAL PRIMARY KEY,
        quarter VARCHAR(20) NOT NULL UNIQUE,
        revenue_target NUMERIC(14, 2) NOT NULL,
        actual_revenue NUMERIC(14, 2) NOT NULL,
        cogs NUMERIC(14, 2) NOT NULL,
        operating_expenses NUMERIC(14, 2) NOT NULL,
        net_profit NUMERIC(14, 2) NOT NULL,
        growth_rate VARCHAR(20) NOT NULL,
        strategic_highlights TEXT NOT NULL,
        operational_risks TEXT NOT NULL,
        auditor_signoff VARCHAR(100) NOT NULL,
        audit_date DATE NOT NULL
      );
    `);

    // 9. Create Enterprise Contracts Table
    await client.query(`
      CREATE TABLE enterprise_contracts (
        id SERIAL PRIMARY KEY,
        contract_code VARCHAR(50) NOT NULL UNIQUE,
        client_name VARCHAR(150) NOT NULL,
        tier VARCHAR(50) NOT NULL,
        deal_value NUMERIC(14, 2) NOT NULL,
        terms VARCHAR(100) NOT NULL,
        payment_status VARCHAR(50) NOT NULL,
        settlement_date DATE NOT NULL,
        region VARCHAR(80) NOT NULL
      );
    `);

    console.log('🌱 Seeding initial datasets into Neon...');

    // Seed Products
    await client.query(`
      INSERT INTO products (id, name, category, price, stock) VALUES
      (1, 'ProBook Ultra Laptop 16GB', 'Electronics', 64999.00, 45),
      (2, 'Apex 5G Smartphone 128GB', 'Electronics', 24999.00, 80),
      (3, 'Aura Noise-Cancelling Headphones', 'Electronics', 7499.00, 110),
      (4, 'Pulse Fitness Smartwatch Pro', 'Electronics', 4999.00, 95),
      (5, 'UltraView 27-inch 4K Monitor', 'Electronics', 19999.00, 32),
      (6, 'SilentKey RGB Mechanical Keyboard', 'Electronics', 3499.00, 120),
      (7, 'Classic Linen Formal Shirt', 'Clothing', 1899.00, 140),
      (8, 'Raw Selvedge Denim Jeans', 'Clothing', 2499.00, 100),
      (9, 'WeatherShield Bomber Jacket', 'Clothing', 3999.00, 60),
      (10, 'AeroCrisp Digital Air Fryer 5L', 'Home & Kitchen', 5999.00, 40),
      (11, 'Barista Deluxe Espresso Maker', 'Home & Kitchen', 12499.00, 28),
      (12, 'Modern Tech Architecture Handbook', 'Books', 999.00, 200);
      SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
    `);

    // Seed Customers
    await client.query(`
      INSERT INTO customers (id, name, email, phone, region) VALUES
      (1, 'Aditya Rao', 'aditya.rao@techcorp.in', '+91 98765 43210', 'Hyderabad'),
      (2, 'Sneha Patel', 'sneha.patel@creatives.co', '+91 98234 56789', 'Bangalore'),
      (3, 'Vikram Malhotra', 'vikram.m@zenithfin.com', '+91 98111 22334', 'Mumbai'),
      (4, 'Ananya Gupta', 'ananya.gupta@delhitech.org', '+91 98450 99887', 'Delhi'),
      (5, 'Karthik Raja', 'karthik.raja@chennaisoft.in', '+91 97890 12345', 'Chennai'),
      (6, 'Pooja Deshmukh', 'pooja.d@puneventures.io', '+91 98666 54321', 'Pune'),
      (7, 'Rohan Mehta', 'rohan.mehta@nexusretail.com', '+91 98333 11223', 'Mumbai'),
      (8, 'Divya Nair', 'divya.nair@keralalogix.in', '+91 94444 88776', 'Bangalore');
      SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));
    `);

    // Seed Sales & Items
    await client.query(`
      INSERT INTO sales (id, customer_id, sale_date, total_amount, status, region) VALUES
      (1, 1, '2026-01-08', 64999.00, 'Completed', 'Hyderabad'),
      (2, 2, '2026-01-14', 32498.00, 'Completed', 'Bangalore'),
      (3, 3, '2026-01-21', 19999.00, 'Completed', 'Mumbai'),
      (4, 4, '2026-01-27', 5999.00, 'Completed', 'Delhi'),
      (5, 5, '2026-02-03', 12499.00, 'Completed', 'Chennai'),
      (6, 6, '2026-02-09', 3998.00, 'Completed', 'Pune'),
      (7, 7, '2026-02-15', 7499.00, 'Completed', 'Mumbai'),
      (8, 8, '2026-02-22', 24999.00, 'Completed', 'Bangalore'),
      (9, 1, '2026-02-26', 4999.00, 'Pending', 'Hyderabad'),
      (10, 2, '2026-03-04', 18990.00, 'Completed', 'Pune'),
      (11, 3, '2026-03-11', 64999.00, 'Completed', 'Delhi'),
      (12, 4, '2026-03-18', 8598.00, 'Completed', 'Chennai'),
      (13, 5, '2026-03-24', 4599.00, 'Cancelled', 'Pune'),
      (14, 6, '2026-03-29', 24999.00, 'Completed', 'Delhi'),
      (15, 7, '2026-04-05', 7499.00, 'Completed', 'Hyderabad');
      SELECT setval('sales_id_seq', (SELECT MAX(id) FROM sales));

      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
      (1, 1, 1, 64999.00, 64999.00),
      (2, 2, 1, 24999.00, 24999.00),
      (2, 3, 1, 7499.00, 7499.00),
      (3, 5, 1, 19999.00, 19999.00),
      (4, 10, 1, 5999.00, 5999.00),
      (5, 11, 1, 12499.00, 12499.00),
      (6, 9, 1, 3998.00, 3998.00),
      (7, 3, 1, 7499.00, 7499.00),
      (8, 2, 1, 24999.00, 24999.00),
      (9, 4, 1, 4999.00, 4999.00),
      (10, 12, 19, 999.00, 18981.00),
      (11, 1, 1, 64999.00, 64999.00),
      (12, 10, 1, 5999.00, 5999.00),
      (13, 11, 1, 4599.00, 4599.00),
      (14, 2, 1, 24999.00, 24999.00),
      (15, 3, 1, 7499.00, 7499.00);
    `);

    // Seed Operating Expenses
    await client.query(`
      INSERT INTO operating_expenses (category, department, amount, budgeted_amount, variance, quarter) VALUES
      ('Cloud Infrastructure & Hosting', 'DevOps & Reliability', 112000.00, 120000.00, -8000.00, 'Q1-2026'),
      ('Sales Commission & Incentives', 'Enterprise Sales', 86500.00, 85000.00, 1500.00, 'Q1-2026'),
      ('Security Audits & Compliance Tooling', 'InfoSec & Legal', 48000.00, 50000.00, -2000.00, 'Q1-2026'),
      ('Marketing & Digital Acquisition', 'Growth Marketing', 39500.00, 45000.00, -5500.00, 'Q1-2026'),
      ('Customer Support Escalation SLAs', 'Customer Success', 26000.00, 25000.00, 1000.00, 'Q1-2026');
    `);

    // Seed Executive Reviews
    await client.query(`
      INSERT INTO executive_reviews (quarter, revenue_target, actual_revenue, cogs, operating_expenses, net_profit, growth_rate, strategic_highlights, operational_risks, auditor_signoff, audit_date) VALUES
      ('Q1-2026', 1200000.00, 1248500.00, 499400.00, 312000.00, 437100.00, '+18.4% YoY', 'North region enterprise tech adoption beat projections by 14%. Cloud Suite Pro reached peak contract renewal rate at 94.2%.', 'Escrow clearance velocity in West region requires tighter SLA monitoring. Supply lead times for server chassis stable.', 'PWC Corporate Assurance (Approved)', '2026-03-20'),
      ('Q4-2025', 1050000.00, 1115000.00, 457150.00, 289000.00, 368850.00, '+15.2% YoY', 'Annual holiday and fiscal close expansion closed 4 Tier-1 enterprise multi-year retainers.', 'Higher travel costs during client summits absorbed 4% of Q4 discretionary sales allocation.', 'Internal Audit Oversight (Approved)', '2025-12-28');
    `);

    // Seed Enterprise Contracts
    await client.query(`
      INSERT INTO enterprise_contracts (contract_code, client_name, tier, deal_value, terms, payment_status, settlement_date, region) VALUES
      ('AGI-2026-09A', 'Apex Global Industries', 'Strategic Enterprise', 284500.00, '36 Mo Multi-Year', 'Settled', '2026-03-22', 'North'),
      ('ZFC-2026-14B', 'Zenith Financial Corp', 'High Value Core', 392000.00, '24 Mo SLA Retainer', 'Settled', '2026-03-21', 'South'),
      ('SAI-2026-03X', 'Solaris Aerospace Inc', 'Defense & Aerospace', 235000.00, '12 Mo Advance Annual', 'Settled', '2026-03-15', 'South'),
      ('HBL-2026-88C', 'Hyperion Biotech Ltd', 'Strategic Enterprise', 198000.00, '24 Mo Milestones', 'In Escrow', '2026-03-19', 'North'),
      ('OCL-2026-05E', 'OmniCorp Logistics', 'Standard Enterprise', 96400.00, 'Net 30 Days', 'Invoice Sent', '2026-03-20', 'West'),
      ('EQC-2026-21M', 'Equinox Capital Partners', 'High Value Core', 115000.00, '12 Mo Quarterly Settle', 'Settled', '2026-03-10', 'South');
    `);

    await client.query('COMMIT');
    console.log('\n✅ Neon PostgreSQL setup completed successfully!');
    console.log('All 8 tables created, indexed, and populated with data.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Neon setup failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupNeon();
