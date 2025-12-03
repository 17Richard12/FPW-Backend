const {default: mongoose, Schema} = require('mongoose');

const categoriesSchema = new Schema (
    {
        
    }, 
    {
        timestamps: false,
    }
);

const Categories = mongoose.model("Categories", categoriesSchema, "categories");

module.exports = Categories;