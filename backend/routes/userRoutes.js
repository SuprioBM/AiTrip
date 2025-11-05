import express from "express";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Admin can list users
router.get("/", protect, authorize("admin"), async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get("/me", protect, async (req, res, next) => {
  res.json(req.user);
});

// Update user (self)
router.put("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Admin: delete user
router.delete("/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
