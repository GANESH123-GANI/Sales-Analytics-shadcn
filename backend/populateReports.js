const pool = require('./src/config/db');

async function setupReportsData() {
  console.log('[Reports Setup] Initializing database tables...');

  // 1. Create operating_expenses table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS operating_expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(120) NOT NULL,
      department VARCHAR(80) NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      budgeted_amount DECIMAL(12, 2) NOT NULL,
      quarter VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. Create executive_reviews table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS executive_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quarter VARCHAR(20) NOT NULL UNIQUE,
      revenue_target DECIMAL(12, 2) NOT NULL,
      actual_revenue DECIMAL(12, 2) NOT NULL,
      cogs DECIMAL(12, 2) NOT NULL,
      operating_expenses DECIMAL(12, 2) NOT NULL,
      net_profit DECIMAL(12, 2) NOT NULL,
      growth_rate VARCHAR(20) NOT NULL,
      strategic_highlights TEXT NOT NULL,
      operational_risks TEXT NOT NULL,
      auditor_signoff VARCHAR(100) NOT NULL,
      audit_date DATE NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. Create enterprise_contracts table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enterprise_contracts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      contract_code VARCHAR(50) NOT NULL UNIQUE,
      client_name VARCHAR(150) NOT NULL,
      tier VARCHAR(60) NOT NULL,
      deal_value DECIMAL(12, 2) NOT NULL,
      terms VARCHAR(60) NOT NULL,
      payment_status ENUM('Settled', 'In Escrow', 'Invoice Sent', 'Review Pending') NOT NULL DEFAULT 'Settled',
      settlement_date DATE NOT NULL,
      region VARCHAR(80) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Populate operating_expenses
  await pool.query('DELETE FROM operating_expenses');
  const expenses = [
    ['Logistics & 3PL Express Delivery', 'Supply Chain', 68450.00, 72000.00, 'Q3 2026'],
    ['Cloud Infrastructure & AWS Microservices', 'Engineering', 24800.00, 26000.00, 'Q3 2026'],
    ['Performance Marketing & Search Ads', 'Growth & Acquisition', 46200.00, 45000.00, 'Q3 2026'],
    ['Field Sales Incentives & Quota Commissions', 'Commercial Sales', 38500.00, 40000.00, 'Q3 2026'],
    ['Regional Warehousing (Hyderabad & Mumbai)', 'Operations', 52000.00, 50000.00, 'Q3 2026'],
    ['Payment Gateway & Settlement Fees (1.8%)', 'Finance', 16175.00, 17500.00, 'Q3 2026'],
  ];
  for (const exp of expenses) {
    await pool.query(
      'INSERT INTO operating_expenses (category, department, amount, budgeted_amount, quarter) VALUES (?, ?, ?, ?, ?)',
      exp
    );
  }

  // Populate executive_reviews
  await pool.query('DELETE FROM executive_reviews');
  const reviews = [
    [
      'Q1 2026',
      280000.00,
      295075.00,
      94400.00,
      58000.00,
      142675.00,
      '+18.2% YoY',
      'Expanded corporate distribution across Telangana and Karnataka. Premium Electronics portfolio beat forecast by 14.2% with 98.4% on-time fulfillment.',
      'Air freight rate volatility during February transit; shifted 60% of inter-hub inventory to dedicated surface line-haul partners to protect margins.',
      'Rajesh Varma, VP Corporate Finance',
      '2026-03-31',
    ],
    [
      'Q2 2026',
      320000.00,
      272977.00,
      87350.00,
      62400.00,
      123227.00,
      '+9.4% YoY',
      'Navigated pre-monsoon retail lull across footwear and outdoor apparel. Secured 5 multi-quarter corporate supply contracts with major tech parks.',
      'Average collection cycle extended to 34 days; instituted a 2% prompt-settlement rebate which accelerated receivables recovery by 6.8 days.',
      'Priya Sundaram, Chief Internal Auditor',
      '2026-06-30',
    ],
    [
      'Q3 2026',
      310000.00,
      330582.00,
      105780.00,
      64250.00,
      160552.00,
      '+24.6% YoY',
      'Pre-festive commercial buying surged in September with record 1.54 Lakhs monthly run-rate. Operational hubs in Hyderabad and Mumbai achieved 94.8% throughput efficiency.',
      'High-velocity wireless electronics inventory requires dynamic safety buffers to protect against supply lead time variations.',
      'Anand Deshmukh, Head of Governance & Audit',
      '2026-09-22',
    ],
  ];
  for (const rev of reviews) {
    await pool.query(
      'INSERT INTO executive_reviews (quarter, revenue_target, actual_revenue, cogs, operating_expenses, net_profit, growth_rate, strategic_highlights, operational_risks, auditor_signoff, audit_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      rev
    );
  }

  // Populate enterprise_contracts
  await pool.query('DELETE FROM enterprise_contracts');
  const contracts = [
    ['TCS-HYD-094', 'Tata Consultancy Services (Synergy Park)', 'Tier-1 Strategic', 149950.00, 'Net 30 Corporate', 'Settled', '2026-09-15', 'Hyderabad'],
    ['INFY-BLR-028', 'Infosys Technologies (Electronic City)', 'Enterprise Premium', 119600.00, 'Net 45 Commercial', 'Settled', '2026-09-12', 'Bangalore'],
    ['RET-MUM-881', 'Reliance Corporate Procurement Fleet', 'Tier-1 Strategic', 174500.00, 'Quarterly Upfront', 'Settled', '2026-09-08', 'Mumbai'],
    ['WIP-PUN-314', 'Wipro Technologies (Hinjewadi Phase 2)', 'Enterprise Premium', 89450.00, 'Net 30 Corporate', 'In Escrow', '2026-09-18', 'Pune'],
    ['APL-DEL-109', 'Apollo Healthcare System Corporate Supply', 'Growth Corporate', 64900.00, 'Net 30 Corporate', 'Settled', '2026-09-04', 'Delhi'],
    ['ZOH-CHN-772', 'Zoho Corporation Global HQ', 'Enterprise Premium', 98200.00, 'Net 30 Corporate', 'Invoice Sent', '2026-09-20', 'Chennai'],
    ['LNT-HYD-441', 'Larsen & Toubro Infotech', 'Growth Corporate', 82000.00, 'Milestone Escrow', 'In Escrow', '2026-09-19', 'Hyderabad'],
    ['HCL-DEL-559', 'HCL Technologies Corporate Tower', 'Growth Corporate', 59990.00, 'Net 45 Commercial', 'Settled', '2026-09-01', 'Delhi'],
  ];
  for (const con of contracts) {
    await pool.query(
      'INSERT INTO enterprise_contracts (contract_code, client_name, tier, deal_value, terms, payment_status, settlement_date, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      con
    );
  }

  console.log('[Reports Setup] Complete! All tables created and populated with rich executive intelligence data.');
  process.exit(0);
}

setupReportsData().catch((err) => {
  console.error('[Reports Setup Error]', err);
  process.exit(1);
});
