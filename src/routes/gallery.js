const express = require('express');
const { queryGallery, insertGallery, updateGallery, deleteGallery } = require('../controllers/gallery');
const router = express.Router();

router.get('/', queryGallery);
router.post('/', insertGallery);
router.put('/:id', updateGallery);
router.delete('/:id', deleteGallery);

module.exports = router;