const { Order, Stock, Product } = require("../models");
const { v4: uuidv4 } = require("uuid");

// GET /api/orders?userId={userId} - Mengambil daftar order
// Query param userId opsional: jika ada, filter by user. Jika tidak, ambil semua (admin)
const queryOrder = async (req, res) => {
  try {
    const { userId } = req.query;

    let filter = {};
    if (userId) {
      filter.userId = userId;
    }

    // Ambil orders dengan sort descending by createdAt
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error queryOrder:", error);
    return res.status(500).json({ error: "Gagal mengambil data order" });
  }
};

// POST /api/orders - Membuat order baru (Checkout)
// Saat checkout, buat order dan kurangi stok dengan status 'pending'
const insertOrder = async (req, res) => {
  try {
    const { userId, items, total, _id } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Data order tidak lengkap" });
    }

    // Validasi dan ambil data produk untuk setiap item
    const validatedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.produk_id);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Produk ${item.produk_id} tidak ditemukan` });
      }

      // Cek stok tersedia
      const stockEntries = await Stock.find({ produk_id: item.produk_id });
      const currentStock = stockEntries.reduce((sum, entry) => {
        if (entry.tipe === "masuk") return sum + entry.jumlah;
        if (entry.tipe === "keluar") return sum - entry.jumlah;
        return sum;
      }, 0);

      if (currentStock < item.jumlah) {
        return res.status(400).json({
          error: `Stok ${product.nama} tidak mencukupi. Tersedia: ${currentStock}, diminta: ${item.jumlah}`,
        });
      }

      validatedItems.push({
        produk_id: item.produk_id,
        jumlah: Number(item.jumlah),
        produk: {
          nama: product.nama,
          harga: product.harga,
          img_url: product.img_url,
        },
      });
    }

    // Buat order baru dengan status 'pending'
    const orderId = _id || uuidv4();
    const orderData = {
      _id: orderId,
      userId,
      items: validatedItems,
      total:
        total ||
        validatedItems.reduce(
          (sum, item) => sum + item.produk.harga * item.jumlah,
          0
        ),
      status: "pending",
    };

    const newOrder = await Order.create(orderData);

    // Kurangi stok untuk setiap item dengan status 'pending'
    for (const item of validatedItems) {
      const stockEntry = {
        _id: uuidv4(),
        produk_id: item.produk_id,
        tipe: "keluar",
        jumlah: item.jumlah,
        keterangan: `Order #${orderId} - ${item.produk.nama}`,
        status: "pending", // Pending sampai order dikonfirmasi
      };
      await Stock.create(stockEntry);
    }

    return res.status(201).json({
      message: "Order berhasil dibuat",
      data: newOrder,
    });
  } catch (error) {
    console.error("Error insertOrder:", error);
    return res
      .status(500)
      .json({ error: "Gagal membuat order", details: error.message });
  }
};

// PATCH /api/orders/:id - Update status order (pending / completed / cancelled)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "completed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({
          error:
            "Status tidak valid. Gunakan: pending, completed, atau cancelled",
        });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    const oldStatus = order.status;

    // Update status order
    order.status = status;
    await order.save();

    // Handle stock berdasarkan perubahan status
    if (oldStatus === "pending" && status === "completed") {
      // Konfirmasi stok - ubah status stock dari pending ke completed
      await confirmStockHelper(id);
    } else if (oldStatus === "pending" && status === "cancelled") {
      // Kembalikan stok - ubah status stock dari pending ke cancelled (efektif mengembalikan stok)
      await returnStockHelper(id);
    }

    return res.status(200).json({
      message: "Status order berhasil diupdate",
      success: true,
      id: order._id,
      status: order.status,
    });
  } catch (error) {
    console.error("Error updateStatus:", error);
    return res
      .status(500)
      .json({ error: "Gagal update status order", details: error.message });
  }
};

// POST /api/orders/:id/return-stock - Mengembalikan stock (jika order ditolak)
// Ubah status stock entries dari 'pending' menjadi 'cancelled'
const returnStock = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    await returnStockHelper(id);

    return res.status(200).json({
      message: "Stok berhasil dikembalikan",
      success: true,
    });
  } catch (error) {
    console.error("Error returnStock:", error);
    return res
      .status(500)
      .json({ error: "Gagal mengembalikan stok", details: error.message });
  }
};

// POST /api/orders/:id/confirm-stock - Konfirmasi pengurangan stock (jika order diterima)
// Ubah status stock entries dari 'pending' menjadi 'completed'
const confirmStock = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    await confirmStockHelper(id);

    return res.status(200).json({
      message: "Stok berhasil dikonfirmasi",
      success: true,
    });
  } catch (error) {
    console.error("Error confirmStock:", error);
    return res
      .status(500)
      .json({ error: "Gagal konfirmasi stok", details: error.message });
  }
};

// Helper function: Kembalikan stok dengan mengubah status stock menjadi 'cancelled'
async function returnStockHelper(orderId) {
  // Cari semua stock entries untuk order ini dengan status 'pending'
  const stockEntries = await Stock.find({
    keterangan: new RegExp(`Order #${orderId}`, "i"),
    status: "pending",
  });

  // Update status menjadi 'cancelled' (ini akan membuat stok kembali)
  for (const entry of stockEntries) {
    entry.status = "cancelled";
    await entry.save();
  }
}

// Helper function: Konfirmasi stok dengan mengubah status stock menjadi 'completed'
async function confirmStockHelper(orderId) {
  // Cari semua stock entries untuk order ini dengan status 'pending'
  const stockEntries = await Stock.find({
    keterangan: new RegExp(`Order #${orderId}`, "i"),
    status: "pending",
  });

  // Update status menjadi 'completed'
  for (const entry of stockEntries) {
    entry.status = "completed";
    await entry.save();
  }
}

module.exports = {
  queryOrder,
  insertOrder,
  updateStatus,
  returnStock,
  confirmStock,
};
