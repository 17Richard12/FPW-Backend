const express = require('express');
const {queryProduct, querySingleProduct, insertProduct, updateProduct, deleteProduct, updateStockProduct} = require('../controllers/product');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', queryProduct);
router.get('/:id', querySingleProduct);
router.post('/', verifyToken, isAdmin, insertProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.put('/:id/stock', verifyToken, isAdmin, updateStockProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);


module.exports = router;