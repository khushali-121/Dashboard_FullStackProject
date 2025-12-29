const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mail");

exports.registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  const exists = await Admin.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    email,
    password: hashedPassword
  });

  res.status(201).json({ message: "Admin registered successfully" });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // IMPORTANT: Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //  Generate token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  admin.otp = otp;
  admin.otpExpiry = Date.now() + 10 * 60 * 1000;
  await admin.save();

  await transporter.sendMail({
    to: admin.email,
    subject: "OTP for Password Reset",
    text: `Your OTP is ${otp}`
  });

  res.json({ message: "OTP sent" });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  const admin = await Admin.findOne({
    email,
    otp,
    otpExpiry: { $gt: Date.now() }
  });

  if (!admin) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  admin.password = await bcrypt.hash(password, 10);
  admin.otp = null;
  admin.otpExpiry = null;
  await admin.save();

  res.json({ message: "Password reset successful" });
};


exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin.id);

  // old password verify
  const isMatch = await bcrypt.compare(oldPassword, admin.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Old password incorrect" });
  }

  // new password set
  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  res.json({ message: "Password changed successfully" });
};
