const {default: mongoose, Schema} = require('mongoose');

const cartSchema = new Schema (
    {
        
    }, 
    {
        timestamps: false,
    }
);

const Cart = mongoose.model("Cart", cartSchema, "cart");

module.exports = Cart;