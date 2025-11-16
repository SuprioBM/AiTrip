import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  getAllDashboardData,
} from "../controllers/adminController.js";


const router = express.Router();

// Protect all routes and allow only admin
router.use(protect);
router.use(authorize("admin"));

// Dashboard route: fetch all collections at once
router.get("/stats/all", getAllDashboardData);

// Dynamic admin CRUD routes
// collection is dynamic, e.g., "User", "Trip", "Booking"
router.get("/:collection", getAll); // GET all docs
router.get("/:collection/:id", getOne); // GET one doc
router.post("/:collection", createOne); // CREATE
router.put("/:collection/:id", updateOne); // UPDATE
router.delete("/:collection/:id", deleteOne); // DELETE

export default router;
