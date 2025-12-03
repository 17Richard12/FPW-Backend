const express = require('express');
const {queryProduct, querySingleProduct, insertProduct, updateProduct, deleteProduct, updateStockProduct} = require('../controllers/product');
const router = express.Router();

router.get('/', queryProduct);
router.get('/:id', querySingleProduct);
router.post('/', insertProduct);
router.put('/:id', updateProduct)
router.put('/:id/stock', updateStockProduct);
router.delete('/:id', deleteProduct);


module.exports = router;