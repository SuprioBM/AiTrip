import express from "express";
import Host from "../models/Host.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const hosts = await Host.find().populate("user", "name email");
    res.json(hosts);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  protect,
  authorize("host", "admin"),
  async (req, res, next) => {
    try {
      const host = await Host.create({ ...req.body, user: req.user._id });
      res.status(201).json(host);
    } catch (err) {
      next(err);
    }
  }
);

router.put("/:id", protect, async (req, res, next) => {
  try {
    const host = await Host.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(host);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    await Host.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
