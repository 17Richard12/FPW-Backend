const { default: mongoose, Schema } = require('mongoose');

const cartSchema = new Schema(
  {
    _id: String,
    produk_id: String,
    jumlah: Number,
    userId: String,
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema, "cart");

module.exports = Cart;