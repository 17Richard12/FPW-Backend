<<<<<<< HEAD
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
=======
const { default: mongoose, Schema } = require("mongoose");

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
>>>>>>> ffef3f56b6626e911def7d8ec4e093196da99fec
);

const Cart = mongoose.model("Cart", cartSchema, "cart");

module.exports = Cart;
