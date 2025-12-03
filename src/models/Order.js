const {default: mongoose, Schema} = require('mongoose');

const orderSchema = new Schema (
    {
        
    }, 
    {
        timestamps: false,
    }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;