const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

// GET /api/users - Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error getAllUsers:", error);
    return res.status(500).json({ error: "Gagal mengambil data users" });
  }
};

// GET /api/user/:id - Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error getUserById:", error);
    return res.status(500).json({ error: "Gagal mengambil data user" });
  }
};

// POST /api/users - Create new user
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      firebase_uid,
      auth_provider,
      email_verified,
      role,
      _id,
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: "Email dan nama harus diisi" });
    }

    const newUserData = {
      _id: _id || uuidv4(),
      name,
      email,
      firebase_uid: firebase_uid || "",
      auth_provider: auth_provider || "local",
      email_verified: email_verified || false,
      role: role || "customer",
    };

    const newUser = await User.create(newUserData);

    return res.status(201).json({
      message: "User berhasil dibuat",
      data: newUser,
    });
  } catch (error) {
    console.error("Error createUser:", error);
    return res
      .status(500)
      .json({ error: "Gagal membuat user", details: error.message });
  }
};

// PUT /api/users/:id - Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, firebase_uid, auth_provider, email_verified, role } =
      req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (firebase_uid !== undefined) updateData.firebase_uid = firebase_uid;
    if (auth_provider !== undefined) updateData.auth_provider = auth_provider;
    if (email_verified !== undefined)
      updateData.email_verified = email_verified;
    if (role !== undefined) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    return res.status(200).json({
      message: "User berhasil diupdate",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updateUser:", error);
    return res
      .status(500)
      .json({ error: "Gagal update user", details: error.message });
  }
};

// DELETE /api/users/:id - Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    return res.status(200).json({
      message: "User berhasil dihapus",
      data: deletedUser,
    });
  } catch (error) {
    console.error("Error deleteUser:", error);
    return res
      .status(500)
      .json({ error: "Gagal menghapus user", details: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
