import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import nodemailer from "nodemailer";

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};
const verificationCodes = new Map();


// Register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });
    
    const user = await User.create({ name, email, password, role });

    // Generate random 5-digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString();

    // Set expiry 2 minutes from now
    const expires = Date.now() + 2 * 60 * 1000;

    // Store in memory
    verificationCodes.set(email, { code, expires });

    // Auto-delete after 2 minutes
    setTimeout(() => verificationCodes.delete(email), 2 * 60 * 1000);

    // Send code via Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your AiTrip Verification Code",
      text: `Your verification code is: ${code}. It will expire in 2 minutes.`,
    };

    transporter
      .sendMail(mailOptions)
      .catch((err) => console.error("Mail error", err));

    res.status(201).json({
      message: "User registered - check email for verification code",
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

export const verify = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    
    
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    const data = verificationCodes.get(email);
    if (!data)
      return res.status(400).json({ message: "Code expired or not found" });

    if (data.code !== code)
      return res.status(400).json({ message: "Invalid code" });

    // Success: mark verified
    user.isVerified = true;
    await user.save();

    // Remove code from memory
    verificationCodes.delete(email);

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};


// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isVerified)
      return res.status(403).json({ message: "Email not verified" });
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// Forgot password (send reset link)
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = generateToken(user._id);
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset your AiTrip password",
        text: `Reset your password here: ${resetUrl}`,
      })
      .catch((err) => console.error("Mail error", err));

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = password;
    await user.save();
    res.json({ message: "Password reset" });
  } catch (err) {
    next(err);
  }
};
