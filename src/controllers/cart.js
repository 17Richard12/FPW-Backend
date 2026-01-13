const { Cart, Product, Stock } = require("../models");
const { v4: uuidv4 } = require("uuid");

// GET /api/cart?userId=xxx
// Mengambil keranjang user + Menghitung stok produk secara realtime
const queryCart = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;
=======
    const { userId } = req.query;
>>>>>>> ffef3f56b6626e911def7d8ec4e093196da99fec

    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId diperlukan" });

    // 1. Ambil semua item keranjang user
    const cartItems = await Cart.find({ userId }).sort({ createdAt: -1 });

    const result = [];

    // 2. Loop setiap item untuk ambil detail produk & hitung stok
    for (const item of cartItems) {
      // Ambil data produk
      const product = await Product.findById(item.produk_id);

      // Jika produk sudah dihapus, item keranjang di-skip (atau bisa dihapus otomatis)
      if (!product) continue;

      // --- LOGIKA HITUNG STOK (Sama seperti kode Firebase Anda) ---
      // Ambil semua history stok untuk produk ini
      const stockHistory = await Stock.find({ produk_id: item.produk_id });

      let totalMasuk = 0;
      let totalKeluar = 0;

      stockHistory.forEach((st) => {
        if (st.tipe === "masuk") {
          totalMasuk += st.jumlah;
        } else if (st.tipe === "keluar") {
          // Hanya hitung keluar jika status bukan 'returned'
          if (st.status !== "returned") {
            totalKeluar += st.jumlah;
          }
        }
      });

      const stokAkhir = totalMasuk - totalKeluar;
      // ------------------------------------------------------------

      // Format data sesuai yang frontend butuhkan
      result.push({
        _id: item._id, // ID Cart
        id: item._id, // Duplicate ID untuk kompatibilitas frontend
        produk_id: item.produk_id,
        jumlah: item.jumlah,
        userId: item.userId,
        createdAt: item.createdAt,
        produk: {
          nama: product.nama,
          harga: product.harga,
          img_url: product.img_url,
          stok: stokAkhir, // Stok hasil perhitungan realtime
        },
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error queryCart:", error);
    return res
      .status(500)
      .json({ error: "Gagal mengambil cart", details: error.message });
  }
};

// POST /api/cart
// Menambah item ke cart (atau update jumlah jika sudah ada)
const insertCart = async (req, res) => {
  try {
    const { produk_id, jumlah, userId, _id } = req.body;

    console.log("Ini userId di backend: ", userId);
    console.log("Ini produk_id di backend: ", produk_id);

    // 1. Validasi
    if (!produk_id || !jumlah || !userId) {
      return res
        .status(400)
        .json({ error: "produk_id, jumlah, dan userId wajib diisi" });
    }

    // 2. Cek apakah produk valid
    const product = await Product.findById(produk_id);
    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    // 3. Cek apakah user sudah punya produk ini di keranjang?
    let cartItem = await Cart.findOne({ userId, produk_id });
    console.log(cartItem);

    if (cartItem) {
      // Skenario A: Update jumlah yang ada
      cartItem.jumlah += Number(jumlah);
      await cartItem.save();
    } else {
      // Skenario B: Buat item baru
      cartItem = await Cart.create({
        _id: _id || uuidv4(),
        userId,
        produk_id,
        jumlah: Number(jumlah),
      });
    }

    // 4. Return response lengkap dengan data produk (agar frontend langsung update UI)
    return res.status(201).json({
      id: cartItem._id,
      _id: cartItem._id,
      userId: userId,
      jumlah: cartItem.jumlah,
      produk_id: produk_id,
      produk: {
        nama: product.nama,
        harga: product.harga,
        img_url: product.img_url,
      },
    });
  } catch (error) {
    console.error("Error insertCart:", error);
    return res
      .status(500)
      .json({ error: "Gagal menambah ke cart", details: error.message });
  }
};

// PUT /api/cart/:id
// Update jumlah item di keranjang secara spesifik
const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const jumlah = Number(req.body.jumlah);

    if (!Number.isInteger(jumlah) || jumlah < 1) {
      return res.status(400).json({ error: "Jumlah tidak valid (harus > 0)" });
    }

    // Cari dan update
    const updatedCart = await Cart.findByIdAndUpdate(
      id,
      { jumlah: jumlah },
      { new: true } // Return data terbaru
    );

    if (!updatedCart) {
      return res.status(404).json({ error: "Item cart tidak ditemukan" });
    }

    return res.status(200).json({
      id: updatedCart._id,
      jumlah: updatedCart.jumlah,
      message: "Jumlah item berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updateCart:", error);
    return res
      .status(500)
      .json({ error: "Gagal update cart", details: error.message });
  }
};

// DELETE /api/cart/:id
// Hapus item dari keranjang
const deleteCart = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCart = await Cart.findByIdAndDelete(id);

    if (!deletedCart) {
      return res.status(404).json({ error: "Item cart tidak ditemukan" });
    }

    return res.status(200).json({
      id: id,
      message: "Item cart berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleteCart:", error);
    return res
      .status(500)
      .json({ error: "Gagal menghapus cart", details: error.message });
  }
};

module.exports = { queryCart, insertCart, updateCart, deleteCart };
