const { Reviews, Product, User, Order } = require("../models");
const { v4: uuidv4 } = require("uuid");

// GET /api/reviews?userId={userId} - Mengambil reviews berdasarkan userId dengan data produk
const queryReviews = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId harus disediakan" });
    }

    // Ambil semua reviews dari user
    const reviews = await Reviews.find({ userId }).sort({ createdAt: -1 });

    // Join dengan data produk
    const reviewsWithProduct = await Promise.all(
      reviews.map(async (review) => {
        const product = await Product.findById(review.produk_id);
        return {
          ...review.toObject(),
          produk: product
            ? {
                nama: product.nama,
                img_url: product.img_url,
                harga: product.harga,
              }
            : null,
        };
      })
    );

    return res.status(200).json(reviewsWithProduct);
  } catch (error) {
    console.error("Error queryReviews:", error);
    return res.status(500).json({ error: "Gagal mengambil reviews" });
  }
};

// GET /api/reviews/product/:id - Mengambil semua review untuk produk dengan rating rata-rata
const querySingleReviews = async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil semua reviews untuk produk ini
    const reviews = await Reviews.find({ produk_id: id }).sort({
      createdAt: -1,
    });

    // Hitung rating rata-rata
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // Join dengan data user (userName dan userPhotoURL sudah ada di reviews)
    const reviewsData = reviews.map((review) => ({
      _id: review._id,
      userId: review.userId,
      userName: review.userName,
      userPhotoURL: review.userPhotoURL,
      rating: review.rating,
      komentar: review.komentar,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    return res.status(200).json({
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      reviews: reviewsData,
    });
  } catch (error) {
    console.error("Error querySingleReviews:", error);
    return res.status(500).json({ error: "Gagal mengambil reviews produk" });
  }
};

// POST /api/reviews - Submit review baru dengan validasi
const insertReviews = async (req, res) => {
  try {
    const {
      userId,
      produk_id,
      rating,
      komentar,
      userName,
      userPhotoURL,
      order_id,
      _id,
    } = req.body;

    // Validasi input
    if (!userId || !produk_id || !rating) {
      return res
        .status(400)
        .json({ error: "userId, produk_id, dan rating harus diisi" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating harus antara 1-5" });
    }

    // Validasi: cek apakah user pernah order produk ini
    const userOrder = await Order.findOne({
      userId,
      "items.produk_id": produk_id,
    });

    if (!userOrder) {
      return res.status(400).json({
        error:
          "Anda harus membeli produk ini terlebih dahulu untuk memberikan review",
      });
    }

    // Buat review baru
    const newReviewData = {
      _id: _id || uuidv4(),
      userId,
      produk_id,
      order_id: order_id || userOrder._id,
      rating: Number(rating),
      komentar: komentar || "",
      userName: userName || "Anonymous",
      userPhotoURL: userPhotoURL || "",
    };

    const newReview = await Reviews.create(newReviewData);

    return res.status(201).json({
      message: "Review berhasil ditambahkan",
      data: newReview,
    });
  } catch (error) {
    console.error("Error insertReviews:", error);
    return res
      .status(500)
      .json({ error: "Gagal menambahkan review", details: error.message });
  }
};

// DELETE /api/reviews/:id - Hapus review
const deleteRevies = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReview = await Reviews.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({ error: "Review tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Review berhasil dihapus",
      data: deletedReview,
    });
  } catch (error) {
    console.error("Error deleteRevies:", error);
    return res.status(500).json({ error: "Gagal menghapus review" });
  }
};

// GET /api/reviews/admin - Ambil semua review (ADMIN)
const queryAllReviewsAdmin = async (req, res) => {
  try {
    // Ambil semua review
    const reviews = await Reviews.find().sort({ createdAt: -1 });

    // Join manual dengan Product dan User
    const formatted = await Promise.all(
      reviews.map(async (r) => {
        // Ambil produk
        const product = r.produk_id
          ? await Product.findById(r.produk_id)
          : null;

        // Ambil user
        const user = r.userId ? await User.findById(r.userId) : null;

        return {
          _id: r._id,
          rating: r.rating,
          komentar: r.komentar,
          createdAt: r.createdAt,
          order_id: r.order_id || "N/A", // order_id tetap muncul
          user: user
            ? {
                name: user.name,
                email: user.email,
                photo: user.photoURL,
              }
            : {
                name: r.userName || "Anonymous",
                photo: r.userPhotoURL || null,
              },
          produk: product
            ? {
                nama: product.nama,
                img_url: product.img_url,
                harga: product.harga,
              }
            : null,
        };
      })
    );

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error queryAllReviewsAdmin:", error);
    return res.status(500).json({ error: "Gagal mengambil semua review" });
  }
};

module.exports = {
  queryReviews,
  querySingleReviews,
  insertReviews,
  deleteRevies,
  queryAllReviewsAdmin,
};
