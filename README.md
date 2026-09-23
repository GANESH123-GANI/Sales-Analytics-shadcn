# 📊 Sales Analytics Dashboard (Mobile & Full-Stack)

A complete, modern, responsive **Sales Analytics Dashboard** mobile application built with **React Native**, **Expo**, **TypeScript**, **Expo Router**, **shadcn-ui** design aesthetic, **Node.js/Express**, and **MySQL**.

All dashboard metrics, charts, and entity listings are dynamically aggregated from MySQL database queries through a REST API.

---

## 🛠️ Technology Stack

### Frontend (Mobile)
- **Framework**: React Native with Expo (SDK 52/57)
- **Language**: TypeScript
- **Routing**: Expo Router (File-based navigation with bottom tabs)
- **UI Design System**: shadcn-ui mobile aesthetic (Neutral slate/zinc tones, crisp borders, subtle badges, and elevation)
- **Charts**: Modular, responsive SVG chart components (Line, Bar, Donut) via `react-native-svg`
- **Icons**: Lucide Icons (`lucide-react-native`)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js REST API
- **Database Driver**: `mysql2/promise` (Connection pool with auto-reconnect)
- **Middleware**: CORS, Express JSON parser, centralized error handler

### Database
- **Engine**: MySQL 8.0+
- **Schema**: Fully relational database (`users`, `products`, `customers`, `sales`, `sale_items`) with primary keys, foreign keys, and indexes.

---

## 📁 Project Structure

```text
sales-analytics/
│
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx           # Tab bar layout navigation
│   │   ├── index.tsx             # Dashboard (KPIs + 4 Charts)
│   │   ├── sales.tsx             # Sales list (Search & Status filters)
│   │   ├── products.tsx          # Products catalog (Stock & Revenue)
│   │   ├── customers.tsx         # Customer directory (Lifetime spend)
│   │   └── reports.tsx           # Executive report & regional table
│   │
│   ├── components/
│   │   ├── KPICard.tsx           # Reusable metric card with badge
│   │   ├── RevenueChart.tsx      # Monthly revenue line chart
│   │   ├── CategoryChart.tsx     # Sales by category bar chart
│   │   ├── RegionChart.tsx       # Sales by region bar chart
│   │   ├── OrderStatusChart.tsx  # Order status donut chart
│   │   ├── SalesCard.tsx         # Sales transaction card
│   │   ├── ProductCard.tsx       # Product metric card
│   │   ├── CustomerCard.tsx      # Customer profile card
│   │   ├── FilterBar.tsx         # Search and filter pills
│   │   └── LoadingView.tsx       # Loading, error & empty state handler
│   │
│   ├── services/
│   │   └── api.ts                # Centralized typed API service client
│   │
│   ├── types/
│   │   └── sales.ts              # TypeScript interfaces
│   │
│   ├── constants/
│   │   ├── config.ts             # Configurable API_BASE_URL (LAN IP / Web)
│   │   └── theme.ts              # shadcn tokens & color palette
│   │
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # MySQL pool configuration
│   │   │
│   │   ├── controllers/
│   │   │   ├── dashboardController.js
│   │   │   ├── salesController.js
│   │   │   ├── productController.js
│   │   │   └── customerController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── salesRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   └── customerRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   └── errorMiddleware.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── setupDb.js                # One-command DB init script
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── database/
    ├── schema.sql                # Relational DDL schema
    └── seed.sql                  # Realistic business seed data
```

---

## 🗄️ MySQL Setup & Database Creation

### 1. Start MySQL
Ensure your MySQL server is running (e.g. MySQL 8.0 service in Windows Services).

### 2. Configure Backend Environment
Edit `backend/.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Ganesh@123
DB_NAME=sales_analytics
PORT=5000
```

### 3. Run Automated Database Setup
Run the setup script from the `backend/` directory:
```bash
cd backend
npm run db:setup
```
This automatically executes `database/schema.sql` and `database/seed.sql`, creating:
- `users`: Staff login accounts
- `products`: 23 products across Electronics, Clothing, Footwear, Home & Kitchen, Books
- `customers`: 16 customers located across Hyderabad, Bangalore, Mumbai, Delhi, Chennai, Pune
- `sales`: 46 realistic sales orders across 2026 with Completed, Pending, and Cancelled statuses
- `sale_items`: 46 line items linking products to sales with quantity and pricing

Alternatively, you can import manually using the MySQL CLI:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

## 🚀 Running & Hosting Options

### Option 1: One-Command Fullstack Production Hosting (API + Web Dashboard)
You can host the entire web dashboard and Express API together on a single port:
```bash
# 1. Build the production web bundle
npm run build

# 2. Start the unified production server
npm start
```
The server will host:
- 🌐 Web Dashboard: `http://localhost:5000` (or your cloud domain)
- 🔌 REST API: `http://localhost:5000/api/...`

### Option 2: Run Web Dashboard in Dev Mode
```bash
npm run web
```
This runs the Expo Metro dev server for the web interface.

### Option 3: Starting Backend Separately in Dev Mode
```bash
npm run backend
# or: cd backend && npm run dev
```

### Option 4: Docker Containerized Hosting
```bash
docker build -t sales-analytics .
docker run -p 5000:5000 -e DB_HOST=host.docker.internal -e DB_USER=root -e DB_PASSWORD=your_password -e DB_NAME=sales_analytics sales-analytics
```

---

## 📱 Starting the Mobile Application (Expo)

```bash
cd mobile
npm install
npx expo start
```

Press:
- `w` — Open in Web Browser
- `a` — Open in connected Android Emulator
- Scan the QR code using the **Expo Go** app on your physical iOS/Android phone!

---

## 📲 Connecting a Physical Android / iOS Phone

When testing Expo on a physical phone:
- `localhost` refers to the phone itself, NOT your computer.
- Your phone and development computer must be on the **same Wi-Fi network**.

### 1. Find your computer's local IP address:
On Windows (PowerShell):
```powershell
ipconfig
```
Look for `IPv4 Address` under your active Wi-Fi or Ethernet adapter (e.g. `10.10.9.75` or `192.168.1.50`).

### 2. Configure Mobile API URL:
In `mobile/constants/config.ts`:
```typescript
export const ENV_PRESETS = {
  PHYSICAL_PHONE: 'http://10.10.9.75:5000/api',
  LOCALHOST_WEB: 'http://localhost:5000/api',
};
```
Or pass the environment variable when starting Expo:
```bash
npx cross-env EXPO_PUBLIC_API_URL=http://<YOUR_IP>:5000/api npx expo start
```

---

## 🌐 Available API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/dashboard/summary` | Total revenue, total orders, total customers, average order value |
| `GET` | `/api/dashboard/monthly-revenue` | Monthly revenue trend (Line chart data) |
| `GET` | `/api/dashboard/category-sales` | Sales grouped by category (Bar chart data) |
| `GET` | `/api/dashboard/region-sales` | Sales grouped by region (Bar chart data) |
| `GET` | `/api/dashboard/order-status` | Completed, Pending, Cancelled order distribution (Donut chart data) |
| `GET` | `/api/sales?search=&status=` | Sales transactions with search & filter |
| `GET` | `/api/products?search=` | Products with price, stock, units sold & revenue |
| `GET` | `/api/customers?search=` | Customers with orders & total spending |
| `GET` | `/api/reports` | Executive summary and regional performance table |

---

## 💡 Code Quality & Architecture
- **Separation of Concerns**: UI components (`mobile/components/`) contain zero API calls. All network requests are centralized in `mobile/services/api.ts`.
- **TypeScript**: Strict types in `mobile/types/sales.ts`.
- **Graceful Error Handling**: Complete with loading skeletons, network retry buttons, and friendly error banners.
