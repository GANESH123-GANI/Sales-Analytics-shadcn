const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Sales routes
router.get('/', salesController.getSales);

module.exports = router;
