const {default: mongoose, Schema} = require('mongoose');

const stockSchema = new Schema (
    {
        _id: String, 
        produk_id: String, 
        tipe: String,
        jumlah: Number,
        keterangan: String,
        status: String,
        createdAt: Date
    }, 
    {
        timestamps: false,
    }
);

const Stock = mongoose.model("Stock", stockSchema, "stock");

module.exports = Stock;