const { default: mongoose, Schema } = require("mongoose");

const productSchema = new Schema(
  {
    _id: String,
    nama: String,
    harga: Number,
    img_name: String,
    img_url: String,
    kategori: String,
    deskripsi: String,
    link_shopee: String,
    link_tokopedia: String,
    active: Boolean,
  },
  {
    timestamps: false,
  }
);

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
