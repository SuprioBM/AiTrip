import express from "express";
import Trip from "../models/Trip.js";
import Location from "../models/Location.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Analytics: trip count
router.get(
  "/stats/trips-count",
  protect,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const count = await Trip.countDocuments();
      res.json({ trips: count });
    } catch (err) {
      next(err);
    }
  }
);

// Analytics: popular locations (simple example)
router.get(
  "/stats/popular-locations",
  protect,
  authorize("admin"),
  async (req, res, next) => {
    try {
      // In real app compute from trips / bookings. Here return all locations as placeholder.
      const locations = await Location.find().limit(10);
      res.json({ popular: locations });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
