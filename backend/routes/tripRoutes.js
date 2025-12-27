import express from "express";
import {
  saveTrip,
  getUserTrips,
  getTripByPlace,
  deleteTrip,
  updateTripLocalhost,
} from "../controllers/tripController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Save or update trip
router.post("/", protect, saveTrip);

// Get all trips of user
router.get("/", protect, getUserTrips);

// Get a trip for specific location (with localhost & partner-up)
router.get("/:placeId", protect, getTripByPlace);

// Update trip localhost
router.put("/:tripId/localhost", protect, updateTripLocalhost);

// Delete a trip
router.delete("/:placeId", protect, deleteTrip);

export default router;
