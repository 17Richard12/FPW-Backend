const { Order, Stock, Product } = require("../models");
const { v4: uuidv4 } = require("uuid");

// ===== GET /api/orders?userId={userId} =====
const queryOrder = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error queryOrder:", error);
    return res.status(500).json({ error: "Gagal mengambil data order" });
  }
};

// ===== POST /api/orders =====
const insertOrder = async (req, res) => {
  try {
    const { userId, items, total, _id } = req.body;
    if (!userId || !items?.length) {
      return res.status(400).json({ error: "Data order tidak lengkap" });
    }

    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.produk_id);
      if (!product) {
        return res.status(404).json({ error: `Produk ${item.produk_id} tidak ditemukan` });
      }

      // Hitung stok real-time dari Stock collection
      const stockEntries = await Stock.find({ produk_id: item.produk_id });
      const currentStock = stockEntries.reduce((sum, entry) => {
        if (entry.tipe === "masuk") return sum + entry.jumlah;
        if (entry.tipe === "keluar" && entry.status === "confirmed") return sum - entry.jumlah;
        return sum;
      }, product.stok || 0);

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

    const orderId = _id || uuidv4();
    const orderData = {
      _id: orderId,
      userId,
      items: validatedItems,
      total: total || validatedItems.reduce((sum, item) => sum + item.produk.harga * item.jumlah, 0),
      status: "pending",
    };

    const newOrder = await Order.create(orderData);

    // Buat stock entry pending
    for (const item of validatedItems) {
      await Stock.create({
        _id: uuidv4(),
        produk_id: item.produk_id,
        tipe: "keluar",
        jumlah: item.jumlah,
        keterangan: `Order #${orderId} - ${item.produk.nama}`,
        status: "pending",
      });
    }

    return res.status(201).json({ message: "Order berhasil dibuat", data: newOrder });
  } catch (error) {
    console.error("Error insertOrder:", error);
    return res.status(500).json({ error: "Gagal membuat order", details: error.message });
  }
};

// ===== PATCH /api/orders/:id =====
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status tidak valid. Gunakan: pending, accepted, atau rejected" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Jika order awalnya pending, lakukan perubahan stok
    if (oldStatus === "pending" && status === "accepted") {
      await confirmStockHelper(id);
    } else if (oldStatus === "pending" && status === "rejected") {
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
    return res.status(500).json({ error: "Gagal update status order", details: error.message });
  }
};

// ===== POST /api/orders/:id/confirm-stock =====
const confirmStock = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });

    await confirmStockHelper(id);

    return res.status(200).json({ message: "Stok berhasil dikonfirmasi", success: true });
  } catch (error) {
    console.error("Error confirmStock:", error);
    return res.status(500).json({ error: "Gagal konfirmasi stok", details: error.message });
  }
};

// ===== POST /api/orders/:id/return-stock =====
const returnStock = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });

    await returnStockHelper(id);

    return res.status(200).json({ message: "Stok berhasil dikembalikan", success: true });
  } catch (error) {
    console.error("Error returnStock:", error);
    return res.status(500).json({ error: "Gagal mengembalikan stok", details: error.message });
  }
};

// ===== Helper Functions =====

// Hanya ubah status pending -> rejected, stok fisik tidak berubah
const returnStockHelper = async (orderId) => {
  const stockEntries = await Stock.find({
    keterangan: new RegExp(`Order #${orderId}`, "i"),
    status: "pending",
  });

  for (const entry of stockEntries) {
    // kembalikan stok fisik
    await Product.findByIdAndUpdate(entry.produk_id, { $inc: { stok: entry.jumlah } });

    // ubah status stock menjadi rejected
    entry.status = "rejected";
    await entry.save();
  }
};


// Kurangi stok fisik, ubah status pending -> confirmed
const confirmStockHelper = async (orderId) => {
  const stockEntries = await Stock.find({
    keterangan: new RegExp(`Order #${orderId}`, "i"),
    status: "pending",
  });

  for (const entry of stockEntries) {
    await Product.findByIdAndUpdate(entry.produk_id, { $inc: { stok: -entry.jumlah } });
    entry.status = "confirmed";
    await entry.save();
  }
};

// ===== EXPORT =====
module.exports = { queryOrder, insertOrder, updateStatus, confirmStock, returnStock };
