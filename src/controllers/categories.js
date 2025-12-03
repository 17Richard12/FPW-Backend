const {Categories, Product} = require('../models');
const { v4: uuidv4 } = require('uuid');

const queryCategories = async (req, res) => {
    try {
    // .sort({ nama: 1 }) artinya Ascending (A-Z)
    const categories = await Categories.find().sort({ nama: 1 });
    
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error queryCategories:", error);
    return res.status(500).json({ error: "Gagal mengambil kategori", details: error.message });
  }
}

const insertCategories = async (req, res) => {
    try {
    const { nama, deskripsi, _id } = req.body;

    // 1. Validasi Input
    if (!nama || nama.trim() === "") {
      return res.status(400).json({ error: "Nama kategori tidak boleh kosong" });
    }

    const namaBersih = nama.trim();

    // 2. Cek apakah kategori sudah ada (Case insensitive opsional, tapi disini exact match)
    const existingCategory = await Categories.findOne({ nama: namaBersih });
    
    if (existingCategory) {
      return res.status(400).json({ error: "Kategori dengan nama ini sudah ada" });
    }

    // 3. Simpan
    const newCategoryData = {
        _id: _id || uuidv4(),
      nama: namaBersih,
      deskripsi: deskripsi || ""
    };

    const newCategory = await Categories.create(newCategoryData);

    return res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      data: newCategory
    });
  } catch (error) {
    console.error("Error insertCategories:", error);
    return res.status(500).json({ error: "Gagal menambah kategori", details: error.message });
  }
}

const updateCategories = async (req, res) => {
    try {
    const { id } = req.params;
    const { nama, deskripsi } = req.body;

    if (!nama || nama.trim() === "") {
      return res.status(400).json({ error: "Nama kategori tidak boleh kosong" });
    }

    const namaBersih = nama.trim();

    // 1. Cek duplikat: Cari kategori lain yang punya nama sama TAPI bukan ID ini
    // $ne artinya "Not Equal"
    const duplicateCheck = await Categories.findOne({ 
        nama: namaBersih, 
        _id: { $ne: id } 
    });

    if (duplicateCheck) {
      return res.status(400).json({ error: "Nama kategori sudah digunakan oleh kategori lain" });
    }

    // 2. Update
    const updatedCategory = await Categories.findByIdAndUpdate(
      id, 
      { nama: namaBersih, deskripsi: deskripsi }, 
      { new: true } // Return data terbaru
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Kategori tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Kategori berhasil diupdate",
      data: updatedCategory
    });

  } catch (error) {
    console.error("Error updateCategories:", error);
    return res.status(500).json({ error: "Gagal update kategori", details: error.message });
  }
}

const deleteCategories = async (req, res) => {
    try {
    const { id } = req.params;

    // 1. Cek apakah kategori ini dipakai oleh Produk
    // Asumsi di model Product field-nya adalah 'kategori_id'
    const productsUsingCategory = await Product.countDocuments({ kategori_id: id });

    if (productsUsingCategory > 0) {
      return res.status(400).json({
        error: "Tidak dapat menghapus kategori karena masih digunakan oleh produk",
        productCount: productsUsingCategory,
      });
    }

    // 2. Hapus
    const deletedCategory = await Categories.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ error: "Kategori tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Kategori berhasil dihapus",
      id: id
    });
  } catch (error) {
    console.error("Error deleteCategories:", error);
    return res.status(500).json({ error: "Gagal menghapus kategori", details: error.message });
  }
}

module.exports = {queryCategories, insertCategories, updateCategories, deleteCategories};