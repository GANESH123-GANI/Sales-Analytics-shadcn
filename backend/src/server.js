const path = require('path');
const dotenv = require('dotenv');

// Load environment variables reliably from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = require('./app');
const PORT = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` Sales Analytics REST API Server running on port ${PORT}`);
  console.log(` Local URL:    http://localhost:${PORT}`);
  console.log(` Network URL:  http://0.0.0.0:${PORT}`);
  console.log(` Endpoints:`);
  console.log(`   - GET /api/dashboard/summary`);
  console.log(`   - GET /api/dashboard/monthly-revenue`);
  console.log(`   - GET /api/dashboard/category-sales`);
  console.log(`   - GET /api/dashboard/region-sales`);
  console.log(`   - GET /api/dashboard/order-status`);
  console.log(`   - GET /api/sales`);
  console.log(`   - GET /api/products`);
  console.log(`   - GET /api/customers`);
  console.log(`   - GET /api/reports`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n[Server Error] Port ${PORT} is already in use by another process.`);
    console.error(`Please stop the existing process running on port ${PORT} or change PORT in backend/.env\n`);
    process.exit(1);
  } else {
    console.error('\n[Server Error]', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
