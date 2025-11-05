import express from "express";
import Review from "../models/Review.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res, next) => {
  try {
    const review = await Review.create({ ...req.body, author: req.user._id });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

router.get("/target/:type/:id", async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const reviews = await Review.find({
      targetType: type,
      targetId: id,
    }).populate("author", "name");
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

export default router;
