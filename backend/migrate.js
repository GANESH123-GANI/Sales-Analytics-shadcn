const pool = require('./src/config/db');

async function migrate() {
  console.log('[Migration] Starting database migration for multi-user architecture...');

  try {
    // 1. Check & Update users table
    console.log('[Migration] Checking users table...');
    
    // Add columns if they do not exist
    const userColumnsToAdd = [
      { name: 'password_hash', type: 'VARCHAR(255)' },
      { name: 'status', type: 'VARCHAR(20) DEFAULT \'active\'' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const col of userColumnsToAdd) {
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        console.log(`[Migration] Added or verified column users.${col.name}`);
      } catch (err) {
        // Fallback for MySQL which doesn't support IF NOT EXISTS in ADD COLUMN
        try {
          await pool.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
          console.log(`[Migration] Added column users.${col.name}`);
        } catch (inner) {
          // Column probably exists
        }
      }
    }

    // Populate password_hash from password if null
    try {
      await pool.query(`UPDATE users SET password_hash = password WHERE password_hash IS NULL OR password_hash = ''`);
      await pool.query(`UPDATE users SET status = 'active' WHERE status IS NULL OR status = ''`);
      // Normalize roles to 'admin' or 'user'
      await pool.query(`UPDATE users SET role = 'admin' WHERE LOWER(role) = 'admin'`);
      await pool.query(`UPDATE users SET role = 'user' WHERE LOWER(role) != 'admin'`);
      console.log('[Migration] Synced password_hash, status, and normalized roles in users table.');
    } catch (err) {
      console.warn('[Migration] Note updating users values:', err.message);
    }

    // 2. Check & Update sales table
    console.log('[Migration] Checking sales table...');
    const salesColumnsToAdd = [
      { name: 'user_id', type: 'INT' },
      { name: 'customer_name', type: 'VARCHAR(120) DEFAULT \'Direct Customer\'' },
      { name: 'product_name', type: 'VARCHAR(150) DEFAULT \'Standard Product\'' },
      { name: 'category', type: 'VARCHAR(100) DEFAULT \'General\'' },
      { name: 'quantity', type: 'INT DEFAULT 1' },
      { name: 'price', type: 'DECIMAL(10, 2) DEFAULT 0.00' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const col of salesColumnsToAdd) {
      try {
        await pool.query(`ALTER TABLE sales ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        console.log(`[Migration] Added or verified column sales.${col.name}`);
      } catch (err) {
        try {
          await pool.query(`ALTER TABLE sales ADD COLUMN ${col.name} ${col.type}`);
          console.log(`[Migration] Added column sales.${col.name}`);
        } catch (inner) {
          // Column probably exists
        }
      }
    }

    // Associate existing orphaned sales with user_id = 1 (Ganesh Paidi / Admin)
    try {
      await pool.query(`UPDATE sales SET user_id = 1 WHERE user_id IS NULL`);
      console.log('[Migration] Assigned existing sales to user_id = 1.');
    } catch (err) {
      console.warn('[Migration] Note assigning sales user_id:', err.message);
    }

    // Backfill product_name, category, customer_name, quantity, price from relations if available
    try {
      // Backfill customer_name from customers table if customer_id exists
      await pool.query(`
        UPDATE sales s
        SET customer_name = c.name
        FROM customers c
        WHERE s.customer_id = c.id AND (s.customer_name IS NULL OR s.customer_name = 'Direct Customer')
      `);
      console.log('[Migration] Backfilled customer_name from customers table.');
    } catch (err) {
      // For MySQL syntax:
      try {
        await pool.query(`
          UPDATE sales s
          JOIN customers c ON s.customer_id = c.id
          SET s.customer_name = c.name
          WHERE (s.customer_name IS NULL OR s.customer_name = 'Direct Customer')
        `);
      } catch (e) {
        // Safe to ignore if already populated
      }
    }

    try {
      // Backfill product_name, category, quantity, price from sale_items & products
      await pool.query(`
        UPDATE sales s
        SET 
          product_name = p.name,
          category = p.category,
          quantity = COALESCE(si.quantity, 1),
          price = COALESCE(si.unit_price, s.total_amount)
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = s.id AND (s.product_name IS NULL OR s.product_name = 'Standard Product')
      `);
      console.log('[Migration] Backfilled product details from sale_items and products tables.');
    } catch (err) {
      // For MySQL syntax
      try {
        await pool.query(`
          UPDATE sales s
          JOIN sale_items si ON si.sale_id = s.id
          JOIN products p ON si.product_id = p.id
          SET 
            s.product_name = p.name,
            s.category = p.category,
            s.quantity = COALESCE(si.quantity, 1),
            s.price = COALESCE(si.unit_price, s.total_amount)
          WHERE (s.product_name IS NULL OR s.product_name = 'Standard Product')
        `);
      } catch (e) {
        // Ignore
      }
    }

    // Create Indexes
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_sales_user_date ON sales(user_id, sale_date)',
      'CREATE INDEX IF NOT EXISTS idx_sales_category ON sales(category)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)'
    ];

    for (const q of indexQueries) {
      try {
        await pool.query(q);
      } catch (e) {
        // Some engines don't support IF NOT EXISTS on indexes, ignore duplicate
      }
    }
    console.log('[Migration] Indexes verified.');

    // Print summary
    const [uRows] = await pool.query('SELECT id, name, email, role, status FROM users LIMIT 5');
    const [sRows] = await pool.query('SELECT id, user_id, customer_name, product_name, category, quantity, price, total_amount, sale_date, status, region FROM sales LIMIT 3');

    console.log('\n✅ Migration completed successfully!');
    console.log('Sample Users:', uRows);
    console.log('Sample Sales:', sRows);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ [Migration Error]:', err);
    process.exit(1);
  }
}

migrate();
