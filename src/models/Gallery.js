const {default: mongoose, Schema} = require('mongoose');

const gallerySchema = new Schema (
    {
        
    }, 
    {
        timestamps: false,
    }
);

const Gallery = mongoose.model("Gallery", gallerySchema, "gallery");

module.exports = Gallery;