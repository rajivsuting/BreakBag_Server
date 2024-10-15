const User = require("../models/User");
const sgMail = require("../config/sendgrid");
const generateOtp = require("../utils/generateOpt");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const validateEmail = require("../utils/validateEmail");

// Register a user (Admin, Agent, or Teamlead)
exports.register = async (req, res) => {
  const { name, email, role, phone, isTeamlead } = req.body;

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Ensure valid role
  const allowedRoles = ["Admin", "Agent"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role provided" });
  }

  // Ensure phone is provided
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      name,
      email,
      role,
      phone,
      isTeamlead: role === "Agent" ? isTeamlead || false : false,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Login: Generate and send OTP
exports.login = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate OTP and hash it
    const otp = generateOtp();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Store OTP and expiry time
    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiration
    await user.save();

    // Send OTP via SendGrid
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    };

    await sgMail.send(msg);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    logger.error(`Error sending OTP: ${error.message}`);
    res.status(500).json({ message: "Error sending OTP", error });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Generate JWT token with 24 hours expiration
    const token = jwt.sign(
      { userId: user._id, role: user.role, isTeamlead: user.isTeamlead },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    // Clear OTP-related fields after successful login
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Set cookie with JWT token, HTTP-only and secure (if using HTTPS)
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // Cookie expires in 24 hours
      sameSite: "strict", // Protects against CSRF attacks
    });

    res.status(200).json({
      message: "Login successful",
      role: user.role,
      isTeamlead: user.isTeamlead,
      user,
    });
  } catch (error) {
    logger.error(`Error verifying OTP: ${error.message}`);
    res.status(500).json({ message: "OTP verification failed", error });
  }
};
