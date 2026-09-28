const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All sales routes are strictly protected and isolated by authenticated user
router.use(authMiddleware);

router.get('/', salesController.getSales);
router.post('/', salesController.createSale);
router.get('/:id', salesController.getSaleById);
router.put('/:id', salesController.updateSale);
router.delete('/:id', salesController.deleteSale);

module.exports = router;
