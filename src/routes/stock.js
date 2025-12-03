const express = require('express');
const {queryStock, insertStock} = require('../controllers/stock');
const router = express.Router();

router.get('/', queryStock);
router.post('/', insertStock);

module.exports = router;