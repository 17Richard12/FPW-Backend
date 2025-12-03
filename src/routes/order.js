const express = require('express');
const { queryOrder, insertOrder, updateStatus, returnStock, confirmStock } = require('../controllers/order');
const router = express.Router();

router.get('/', queryOrder);
router.post('/', insertOrder);
router.patch('/:id', updateStatus);
router.post('/:id/return-stock', returnStock);
router.post('/:id/confirm-stock', confirmStock);

module.exports = router;