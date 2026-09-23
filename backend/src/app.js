const express = require('express');
const cors = require('cors');
const dashboardRoutes = require('./routes/dashboardRoutes');
const salesRoutes = require('./routes/salesRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dashboardController = require('./controllers/dashboardController');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Enable Cross-Origin Resource Sharing for mobile client
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'sales-analytics-api',
    database: 'MySQL'
  });
});

// Mount modular API routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.get('/api/reports', dashboardController.getReports);

const path = require('path');
const fs = require('fs');

// Serve static web build if present
const distPath = path.resolve(__dirname, '../../mobile/dist');
if (fs.existsSync(distPath)) {
  console.log(`[Static] Serving web client from ${distPath}`);
  app.use(express.static(distPath));

  // SPA client-side routing fallback for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Fallback & error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
