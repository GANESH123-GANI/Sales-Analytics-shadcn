# Sales Analytics Backend REST API

Node.js + Express.js REST API with MySQL for business sales data and analytics.

---

## 🚀 Quick Start

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sales_analytics
PORT=5000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database Schema & Seed Data
Run the automated initialization script:
```bash
npm run db:setup
```
This script connects to MySQL, creates the `sales_analytics` database if it doesn't exist, applies `database/schema.sql`, and populates realistic transactions with `database/seed.sql`.

### 4. Start the Server
Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

---

## 📡 Available API Endpoints

### Health Check
- `GET /api/health` — Checks API and service status

### Dashboard Analytics
- `GET /api/dashboard/summary` — Returns `{ totalRevenue, totalOrders, totalCustomers, averageOrderValue }`
- `GET /api/dashboard/monthly-revenue` — Returns monthly performance for Line Chart
- `GET /api/dashboard/category-sales` — Returns product category volume for Bar Chart
- `GET /api/dashboard/region-sales` — Returns regional sales breakdown for Bar Chart
- `GET /api/dashboard/order-status` — Returns Completed, Pending, and Cancelled counts for Donut Chart

### Entities & Listings
- `GET /api/sales?search=&status=` — Filterable and searchable sales orders
- `GET /api/products?search=` — Product catalog with units sold and gross revenue
- `GET /api/customers?search=` — Customer directory with order counts and lifetime spend

### Reports
- `GET /api/reports` — Executive summary with top performers and regional breakdown table
