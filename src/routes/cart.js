const express = require('express');
const {queryCart, insertCart, updateCart, deleteCart} = require('../controllers/cart');
const router = express.Router();

router.get('/', queryCart);
router.post('/', insertCart);
router.put('/:id', updateCart);
router.delete('/:id', deleteCart);

module.exports = router;