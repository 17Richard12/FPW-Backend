const { default: mongoose, Schema } = require("mongoose");

const reviewsSchema = new Schema(
  {
    _id: String,
    userId: String,
    produk_id: String,
    order_id: String,
    rating: Number,
    komentar: String,
    userName: String,
    userPhotoURL: String,
  },
  {
    timestamps: true,
  }
);

const Reviews = mongoose.model("Reviews", reviewsSchema, "reviews");

module.exports = Reviews;
