import express from "express";
import Location from "../models/Location.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// CRUD for locations
router.get("/", async (req, res, next) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    next(err);
  }
});

router.post("/", protect, authorize("admin"), async (req, res, next) => {
  try {
    const loc = await Location.create(req.body);
    res.status(201).json(loc);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    const loc = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(loc);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
