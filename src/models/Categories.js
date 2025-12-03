const {default: mongoose, Schema} = require('mongoose');

const categoriesSchema = new Schema (
    {
        _id: String, 
        nama: String,
    }, 
    {
        timestamps: true,
    }
);

const Categories = mongoose.model("Categories", categoriesSchema, "categories");

module.exports = Categories;