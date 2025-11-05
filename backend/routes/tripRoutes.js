import express from "express";
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
} from "../controllers/tripController.js";
// import { generateItinerary } from "../controllers/aiController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(protect, getTrips).post(protect, createTrip);
router.post("/generate", protect); // AI generation endpoint
router
  .route("/:id")
  .get(protect, getTrip)
  .put(protect, updateTrip)
  .delete(protect, deleteTrip);

export default router;
