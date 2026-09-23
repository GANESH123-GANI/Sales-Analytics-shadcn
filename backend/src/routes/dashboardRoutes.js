const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// High-performance single-trip combined dashboard
router.get('/all', dashboardController.getDashboardAll);
router.get('/', dashboardController.getDashboardAll);

// Individual Dashboard routes
router.get('/summary', dashboardController.getSummary);
router.get('/monthly-revenue', dashboardController.getMonthlyRevenue);
router.get('/category-sales', dashboardController.getCategorySales);
router.get('/region-sales', dashboardController.getRegionSales);
router.get('/order-status', dashboardController.getOrderStatus);

module.exports = router;
