import express from "express";
import {
  getLocalhostsByLocation,
  getAllLocalhosts,
  getLocalhostById,
  createLocalhost,
  updateLocalhost,
  deleteLocalhost,
} from "../controllers/localHost.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// ===== ADMIN ROUTES (Protected) =====
router.get("/admin/all", protect, adminOnly, getAllLocalhosts);
router.post("/admin/create", protect, adminOnly, createLocalhost);
router.get("/admin/:id", protect, adminOnly, getLocalhostById);
router.put("/admin/:id", protect, adminOnly, updateLocalhost);
router.delete("/admin/:id", protect, adminOnly, deleteLocalhost);

// ===== PUBLIC ROUTES =====
router.get("/:locationCode", getLocalhostsByLocation);

export default router;
