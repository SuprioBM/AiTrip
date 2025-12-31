import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createReview,
  getLocationReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getAllReviewsAdmin,
  getReviewById,
} from "../controllers/reviewController.js";

const router = express.Router();

// Creates a new review (requires authentication)
router.post("/", protect, createReview);

// Gets reviews with pagination for a location
router.get("/location/:locationId", getLocationReviews);

// Updates a review (requires authentication)
router.put("/:reviewId", protect, updateReview);

// Deletes a review (requires authentication)
router.delete("/:reviewId", protect, deleteReview);

// Marks review as helpful (public)
router.post("/:reviewId/helpful", markHelpful);

// Admin: Get all reviews with filters
router.get("/getAllReviews", getAllReviewsAdmin);

// Get review by ID
router.get("/getreviewbyid", getReviewById);

export default router;
