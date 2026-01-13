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

// POST /api/cart - Add to cart
router.post("/", insertCart);

// PUT /api/cart/:id - Update cart item
router.put("/:id", updateCart);

// DELETE /api/cart/:id - Delete cart item
router.delete("/:id", deleteCart);

module.exports = router;
