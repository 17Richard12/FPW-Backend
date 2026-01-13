const { default: mongoose, Schema } = require("mongoose");

const orderSchema = new Schema(
  {
    _id: String,
    userId: String,
    items: [
      {
        produk_id: String,
        jumlah: Number,
        produk: {
          nama: String,
          harga: Number,
          img_url: String,
        },
      },
    ],
    total: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;
