const express = require('express');
const { queryReviews, querySingleReviews, insertReviews, deleteRevies } = require('../controllers/reviews');
const router = express.Router();

router.get('/', queryReviews);
router.get('/:id', querySingleReviews);
router.post('/', insertReviews);
router.delete('/:id', deleteRevies);

module.exports = router;