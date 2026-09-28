const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All analytics endpoints require valid user authentication and isolate by req.user.id
router.use(authMiddleware);

router.get('/summary', dashboardController.getSummary);
router.get('/monthly', dashboardController.getMonthlyRevenue);
router.get('/products', dashboardController.getProductSales);
router.get('/categories', dashboardController.getCategorySales);
router.get('/regions', dashboardController.getRegionSales);

module.exports = router;
