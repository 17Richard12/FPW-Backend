<<<<<<< HEAD
const express = require('express');
const { queryCart, insertCart, updateCart, deleteCart } = require('../controllers/cart');
const router = express.Router();

router.get('/', queryCart);
router.post('/', insertCart);
router.put('/:id', updateCart);
router.delete('/:id', deleteCart);
=======
const express = require("express");
const {
  queryCart,
  insertCart,
  updateCart,
  deleteCart,
} = require("../controllers/cart");
const router = express.Router();

// GET /api/cart?userId=xxx - Get cart by userId (query param)
router.get("/", queryCart);
>>>>>>> ffef3f56b6626e911def7d8ec4e093196da99fec

// POST /api/cart - Add to cart
router.post("/", insertCart);

// PUT /api/cart/:id - Update cart item
router.put("/:id", updateCart);

// DELETE /api/cart/:id - Delete cart item
router.delete("/:id", deleteCart);

module.exports = router;
