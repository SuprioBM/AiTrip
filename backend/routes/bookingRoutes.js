import express from "express";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res, next) => {
  try {
    const booking = await Booking.create({ ...req.body, user: req.user._id });
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

router.get("/", protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate(
      "host trip"
    );
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/cancel", protect, async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

export default router;
