import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createReview,
  getLocationReviews,
  updateReview,
  deleteReview,
  markHelpful,
} from "../controllers/reviewController.js";

const router = express.Router();

// Create a new review (requires authentication)
router.post("/", protect, createReview);

// Get reviews with pagination for a location
router.get("/location/:locationId", getLocationReviews);

// Update a review (requires authentication)
router.put("/:reviewId", protect, updateReview);

// Delete a review (requires authentication)
router.delete("/:reviewId", protect, deleteReview);

// Mark review as helpful (public)
router.post("/:reviewId/helpful", markHelpful);

export default router;
