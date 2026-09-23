const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Customer routes
router.get('/', customerController.getCustomers);

module.exports = router;
