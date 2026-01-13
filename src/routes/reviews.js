const express = require("express");
const {
  queryReviews,
  querySingleReviews,
  insertReviews,
  deleteRevies,
  queryAllReviewsAdmin,
} = require("../controllers/reviews");
const router = express.Router();

// GET /api/reviews?userId={userId} - Get reviews by user
router.get("/", queryReviews);

// GET /api/reviews/product/:id - Get reviews by product
router.get("/product/:id", querySingleReviews);

// POST /api/reviews - Submit new review
router.post("/", insertReviews);

// DELETE /api/reviews/:id - Delete review
router.delete("/:id", deleteRevies);

router.get("/admin", queryAllReviewsAdmin);

module.exports = router;
