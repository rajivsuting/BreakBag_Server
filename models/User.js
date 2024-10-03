const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Adding name for user identification
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true }, // Add phone for OTP verification
  role: {
    type: String,
    enum: ["Admin", "Agent"],
    required: true,
  },
  isTeamlead: {
    type: Boolean,
    default: false, // Field to indicate if the Agent is also a Teamlead
  },
  otp: String,
  otpExpiry: Date, // Field for storing OTP expiration time
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp for when the user is created
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Timestamp for tracking last update
  },
});

// Middleware to automatically update 'updatedAt' on save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", userSchema);
