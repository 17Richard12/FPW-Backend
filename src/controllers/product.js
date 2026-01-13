const { Product, Stock, Categories } = require("../models");
const { v4: uuidv4 } = require("uuid");

// GET /api/products - Mengambil semua produk dengan stok real-time dan data kategori
const queryProduct = async (req, res) => {
  try {
    const { keyword, kategori } = req.query;

    let filter = {};
    if (keyword) {
      filter.nama = new RegExp(keyword, "i");
    }
    if (kategori) {
      filter.kategori = new RegExp(kategori, "i");
    }

    const products = await Product.find(filter).exec();

    // Untuk setiap produk, hitung stok real-time dan ambil data kategori
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        // Hitung total stok dari collection stock
        const stockEntries = await Stock.find({ produk_id: product._id });
        const totalStock = stockEntries.reduce((sum, entry) => {
          if (entry.tipe === "masuk") return sum + entry.jumlah;
          if (entry.tipe === "keluar") return sum - entry.jumlah;
          return sum;
        }, 0);

        // Ambil data kategori
        const category = await Categories.findById(product.kategori);

        return {
          ...product.toObject(),
          stok: totalStock,
          kategori_data: category || null,
        };
      })
    );

    return res.status(200).json(productsWithStock);
  } catch (error) {
    console.error("Error queryProduct:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// GET /api/products/:id - Mengambil detail produk beserta stok real-time
const querySingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(String(id)).exec();

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Hitung stok real-time
    const stockEntries = await Stock.find({ produk_id: id });
    const totalStock = stockEntries.reduce((sum, entry) => {
      if (entry.tipe === "masuk") return sum + entry.jumlah;
      if (entry.tipe === "keluar") return sum - entry.jumlah;
      return sum;
    }, 0);

    // Ambil data kategori
    const category = await Categories.findById(product.kategori);

    return res.status(200).json({
      ...product.toObject(),
      stok: totalStock,
      kategori_data: category || null,
    });
  } catch (error) {
    console.error("Error querySingleProduct:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// POST /api/products - Menambah produk baru beserta stok awal
const insertProduct = async (req, res) => {
  try {
    const {
      nama,
      kategori_id,
      harga,
      img_url,
      deskripsi,
      stok,
      _id,
      img_name,
      link_shopee,
      link_tokopedia,
      active,
    } = req.body;

    if (!nama || !harga) {
      return res
        .status(400)
        .json({ error: "Nama dan harga produk harus diisi" });
    }

    // Buat produk baru
    const productData = {
      _id: _id || uuidv4(),
      nama,
      harga: Number(harga),
      img_name: img_name || "",
      img_url: img_url || "",
      kategori: kategori_id || "",
      deskripsi: deskripsi || "",
      link_shopee: link_shopee || "",
      link_tokopedia: link_tokopedia || "",
      active: active !== undefined ? active : true,
    };

    const newProduct = await Product.create(productData);

    // Jika ada stok awal, buat entry stock
    if (stok && stok > 0) {
      const stockData = {
        _id: uuidv4(),
        produk_id: newProduct._id,
        tipe: "masuk",
        jumlah: Number(stok),
        keterangan: "Stok awal produk",
        status: "completed",
      };
      await Stock.create(stockData);
    }

    return res.status(201).json({
      message: "Produk berhasil ditambahkan",
      data: {
        ...newProduct.toObject(),
        stok: stok || 0,
      },
    });
  } catch (error) {
    console.error("Error insertProduct:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// PUT /api/products/:id - Update data produk (tidak termasuk stok)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama,
      kategori_id,
      harga,
      img_url,
      img_name,
      deskripsi,
      link_shopee,
      link_tokopedia,
      active,
    } = req.body;

    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (harga !== undefined) updateData.harga = Number(harga);
    if (kategori_id !== undefined) updateData.kategori = kategori_id;
    if (img_url !== undefined) updateData.img_url = img_url;
    if (img_name !== undefined) updateData.img_name = img_name;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (link_shopee !== undefined) updateData.link_shopee = link_shopee;
    if (link_tokopedia !== undefined)
      updateData.link_tokopedia = link_tokopedia;
    if (active !== undefined) updateData.active = active;

    const result = await Product.findByIdAndUpdate(String(id), updateData, {
      new: true,
    }).exec();

    if (!result) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Produk berhasil diupdate",
      data: result,
    });
  } catch (error) {
    console.error("Error updateProduct:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// PUT /api/products/:id/stock - Update stok produk dengan mengubah entry stok awal
const updateStockProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { stok } = req.body;

    if (stok === undefined || stok < 0) {
      return res.status(400).json({ error: "Stok harus berupa angka positif" });
    }

    // Cek apakah produk ada
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Hitung stok sebelumnya
    const stockEntries = await Stock.find({ produk_id: id });
    const previousStock = stockEntries.reduce((sum, entry) => {
      if (entry.tipe === "masuk") return sum + entry.jumlah;
      if (entry.tipe === "keluar") return sum - entry.jumlah;
      return sum;
    }, 0);

    // Hitung adjustment yang diperlukan
    const adjustment = Number(stok) - previousStock;

    // Buat entry stok baru untuk adjustment
    if (adjustment !== 0) {
      const stockData = {
        _id: uuidv4(),
        produk_id: id,
        tipe: adjustment > 0 ? "masuk" : "keluar",
        jumlah: Math.abs(adjustment),
        keterangan: `Penyesuaian stok dari ${previousStock} ke ${stok}`,
        status: "completed",
      };
      await Stock.create(stockData);
    }

    return res.status(200).json({
      message: "Stok berhasil diupdate",
      stok: Number(stok),
      previous_stock: previousStock,
      adjustment: adjustment,
    });
  } catch (error) {
    console.error("Error updateStockProduct:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// DELETE /api/products/:id - Hapus produk dan semua stock entries terkait
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Hapus produk
    const result = await Product.findByIdAndDelete(String(id)).exec();

    if (!result) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Hapus semua stock entries terkait produk ini
    await Stock.deleteMany({ produk_id: id });

    return res.status(200).json({
      message: "Produk dan semua stock entries terkait berhasil dihapus",
      data: result,
    });
  } catch (error) {
    console.error("Error deleteProduct:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  queryProduct,
  querySingleProduct,
  insertProduct,
  updateProduct,
  updateStockProduct,
  deleteProduct,
};
