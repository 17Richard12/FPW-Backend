const express = require('express');
const {queryProduct, querySingleProduct, insertProduct, updateProduct, deleteProduct} = require('../controllers/product');
const router = express.Router();

router.get('/', queryProduct);
router.get('/:id', querySingleProduct);
router.post('/', insertProduct);
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct);


module.exports = router;