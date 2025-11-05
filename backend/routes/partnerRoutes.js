import express from "express";
import Partner from "../models/Partner.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const items = await Partner.find().populate("user", "name email");
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  protect,
  authorize("partner", "admin"),
  async (req, res, next) => {
    try {
      const partner = await Partner.create({ ...req.body, user: req.user._id });
      res.status(201).json(partner);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id/verify",
  protect,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const partner = await Partner.findByIdAndUpdate(
        req.params.id,
        { verified: true },
        { new: true }
      );
      res.json(partner);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
