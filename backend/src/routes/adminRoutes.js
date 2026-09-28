const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Enforce both Authentication and Admin Role on all routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.get('/users/:id/sales', adminController.getUserSales);
router.get('/users/:id/analytics', adminController.getUserAnalytics);

module.exports = router;
