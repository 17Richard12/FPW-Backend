const express = require('express');
const { queryCategories, insertCategories, updateCategories, deleteCategories } = require('../controllers/categories');
const router = express.Router();

router.get('/', queryCategories);
router.post('/', insertCategories);
router.put('/:id', updateCategories);
router.delete('/:id', deleteCategories);

module.exports = router;