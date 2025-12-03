const express = require('express');
const {queryCart, insertCart, updateCart, deleteCart} = require('../controllers/cart');
const router = express.Router();

router.get('/:id', queryCart);
router.post('/', insertCart);
router.put('/:id', updateCart);
router.delete('/:id', deleteCart);

module.exports = router;