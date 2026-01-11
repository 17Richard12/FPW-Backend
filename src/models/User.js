const { default: mongoose, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    _id: String,
    name: String,
    email: String,
    firebase_uid: String,
    auth_provider: String,
    email_verified: Boolean,
    role: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
