const {Gallery} = require('../models');
const { v4: uuidv4 } = require('uuid');

const queryGallery = async (req, res) => {
    try {
    // Opsional: Bisa filter berdasarkan status active (misal: ?active=true)
    const { active } = req.query;
    
    let filter = {};
    if (active) {
        filter.active = active === 'true';
    }

    // Ambil data dan urutkan berdasarkan createdAt descending (terbaru diatas)
    const galleries = await Gallery.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(galleries);
  } catch (error) {
    console.error("Error queryGallery:", error);
    return res.status(500).json({ error: "Gagal mengambil data gallery", details: error.message });
  }
}

const insertGallery = async (req, res) => {
    try {
    const { image_url, alt_text, description, _id } = req.body;

    // 1. Validasi Input
    if (!image_url) {
      return res.status(400).json({ error: "image_url wajib diisi" });
    }

    // 2. Siapkan data baru
    const newGalleryData = {
        _id: _id || uuidv4(), 
      image_url: image_url,
      alt_text: alt_text || "Gambar gallery", // Default value
      description: description || "",
      active: true, // Default active saat dibuat
    };

    // 3. Simpan ke MongoDB
    const newGallery = await Gallery.create(newGalleryData);

    return res.status(201).json({
      message: "Gambar gallery berhasil ditambahkan",
      data: newGallery
    });
  } catch (error) {
    console.error("Error insertGallery:", error);
    return res.status(500).json({ error: "Gagal menambah gallery", details: error.message });
  }
}

const updateGallery = async (req, res) => {
    try {
    const { id } = req.params;
    const updateData = req.body; // { image_url, alt_text, description, active }

    // findByIdAndUpdate:
    // Parameter 1: ID yang dicari
    // Parameter 2: Data yang mau diupdate
    // Parameter 3: { new: true } agar yang dikembalikan adalah data SETELAH diupdate
    const updatedGallery = await Gallery.findByIdAndUpdate(id, updateData, { new: true });

    // Jika data tidak ditemukan (ID salah)
    if (!updatedGallery) {
      return res.status(404).json({ error: "Gambar gallery tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Gambar gallery berhasil diupdate",
      data: updatedGallery
    });
  } catch (error) {
    console.error("Error updateGallery:", error);
    return res.status(500).json({ error: "Gagal update gallery", details: error.message });
  }
}

const deleteGallery = async (req, res) => {
    try {
    const { id } = req.params;

    const deletedGallery = await Gallery.findByIdAndDelete(id);

    if (!deletedGallery) {
      return res.status(404).json({ error: "Gambar gallery tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Gambar gallery berhasil dihapus",
      id: id
    });
  } catch (error) {
    console.error("Error deleteGallery:", error);
    return res.status(500).json({ error: "Gagal menghapus gallery", details: error.message });
  }
}

module.exports = {queryGallery, insertGallery, updateGallery, deleteGallery};