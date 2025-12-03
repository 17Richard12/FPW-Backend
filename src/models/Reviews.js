const {default: mongoose, Schema} = require('mongoose');

const reviewsSchema = new Schema (
    {
        
    }, 
    {
        timestamps: false,
    }
);

const Reviews = mongoose.model("Reviews", reviewsSchema, "reviews");

module.exports = Reviews;