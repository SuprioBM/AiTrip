import express from "express";
import {
  saveTrip,
  getUserTrips,
  getTripByPlace,
  deleteTrip,
} from "../controllers/tripController.js";

const router = express.Router();

// Save or update trip
router.post("/", saveTrip);

// Get all trips of user
router.get("/", getUserTrips);

// Get a trip for specific location (with localhost & partner-up)
router.get("/:placeId", getTripByPlace);

// Delete a trip
router.delete("/:placeId", deleteTrip);

export default router;
