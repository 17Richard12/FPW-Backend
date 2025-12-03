const {Stock} = require('../models');
const { v4: uuidv4 } = require('uuid');

const queryStock = async (req, res) => {
    try {
        const { produk_id } = req.query;
        
        // 1. Buat object filter kosong
        let filter = {};
        
        // 2. Jika ada parameter produk_id, tambahkan ke filter
        if (produk_id) {
        filter.produk_id = produk_id;
        }

        // 3. Query ke database
        // .find(filter): Cari berdasarkan filter
        // .sort({ createdAt: -1 }): Urutkan descending (terbaru di atas)
        const stocks = await Stock.find(filter).sort({ createdAt: -1 });

        return res.status(200).json(stocks);
    } catch (error) {
        console.error("Error queryStock:", error);
        return res.status(500).json({ error: "Gagal mengambil data stok" });
    }
}

const insertStock = async (req, res) => {
    try {
    const { produk_id, tipe, jumlah, keterangan, status, _id } = req.body;

    if (!produk_id || !tipe || !jumlah) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const newStockData = {
      // LOGIKA: Jika _id dikirim (migrasi), pakai itu. 
      // Jika tidak (data baru), buat ID string baru pakai UUID.
      _id: _id || uuidv4(), 
      
      produk_id,
      tipe,
      jumlah: Number(jumlah),
      keterangan: keterangan || "",
      status: status || "completed",
    };

    const newStock = await Stock.create(newStockData);

    return res.status(201).json({
      message: "Berhasil disimpan",
      data: newStock
    });
  } catch (error) {
    console.error("Error insertStock:", error);
    return res.status(500).json({ error: "Gagal menambah stok", details: error.message });
  }
}

module.exports = {queryStock, insertStock};