const {default: mongoose, Schema} = require('mongoose');

const gallerySchema = new Schema (
    {
        _id: String, 
        image_url: String, 
        alt_text: String,
        desription: String, 
        active: Boolean,
    }, 
    {
        timestamps: true,
    }
);

const Gallery = mongoose.model("Gallery", gallerySchema, "gallery");

module.exports = Gallery;