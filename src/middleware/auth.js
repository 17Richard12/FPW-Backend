const admin = require("firebase-admin");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const user = await User.findOne({ firebase_uid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ error: "User data not found in database" });
    }

    req.user = user;
    
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ error: "Unauthorized: Token tidak valid" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden: Akses khusus Admin" });
  }
};

module.exports = { verifyToken, isAdmin };