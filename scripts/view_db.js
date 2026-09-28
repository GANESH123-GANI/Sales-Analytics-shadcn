const pool = require('../backend/src/config/db');

async function viewDatabase() {
  console.log('\n================================================================');
  console.log('       SALES ANALYTICS — LIVE DATABASE TABLE VIEWER');
  console.log('================================================================\n');

  try {
    // 1. List all tables
    const [tables] = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('📂 Database Tables in Schema:');
    tables.forEach((t, i) => console.log(`   ${i + 1}. ${t.table_name}`));

    // 2. Query Users Table
    const [users] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users ORDER BY id ASC'
    );
    console.log(`\n👥 USERS TABLE (${users.length} registered accounts):`);
    console.table(
      users.map((u) => ({
        ID: u.id,
        Name: u.name,
        Email: u.email,
        Role: (u.role || '').toUpperCase(),
        Status: (u.status || '').toUpperCase(),
        Joined: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : 'N/A',
      }))
    );

    // 3. Query Sales Table
    const [sales] = await pool.query(
      'SELECT id, user_id, product_name, category, total_amount, quantity, customer_name, sale_date, status FROM sales ORDER BY id DESC LIMIT 15'
    );
    console.log(`\n💳 SALES TABLE (Latest ${sales.length} transactions):`);
    console.table(
      sales.map((s) => ({
        ID: s.id,
        Tenant_ID: s.user_id,
        Product: s.product_name,
        Category: s.category,
        Amount: `₹${(Number(s.total_amount) || 0).toLocaleString('en-IN')}`,
        Qty: s.quantity || 1,
        Customer: s.customer_name || 'N/A',
        Date: s.sale_date ? new Date(s.sale_date).toISOString().split('T')[0] : 'N/A',
        Status: s.status,
      }))
    );

    // 4. Products Table (Preview)
    const [products] = await pool.query(
      'SELECT id, name, category, price, stock, sku FROM products ORDER BY id ASC LIMIT 10'
    ).catch(() => [[]]);
    if (products.length > 0) {
      console.log(`\n📦 PRODUCTS TABLE (Sample ${products.length} items):`);
      console.table(
        products.map((p) => ({
          ID: p.id,
          Name: p.name,
          Category: p.category,
          Price: `₹${(Number(p.price) || 0).toLocaleString('en-IN')}`,
          Stock: p.stock,
          SKU: p.sku || 'N/A',
        }))
      );
    }

    // 5. Summary counts
    const [summary] = await pool.query(
      'SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_revenue FROM sales'
    );
    const totSales = summary[0]?.total_sales || 0;
    const totRev = Math.round(Number(summary[0]?.total_revenue) || 0);

    console.log('\n📊 DATABASE AGGREGATE TOTALS:');
    console.log(`   • Total Users:    ${users.length}`);
    console.log(`   • Total Sales:    ${totSales}`);
    console.log(`   • Gross Revenue:  ₹${totRev.toLocaleString('en-IN')}\n`);
    console.log('================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to view database:', error.message);
    process.exit(1);
  }
}

viewDatabase();
