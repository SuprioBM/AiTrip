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

// POST: Create new review for a location (authenticated users only)
router.post("/", protect, createReview);

// GET: Fetch paginated reviews for a specific location with average rating
router.get("/location/:locationId", getLocationReviews);

// PUT: Update review rating/comment (users can only edit their own reviews)
router.put("/:reviewId", protect, updateReview);

// DELETE: Remove a review permanently (users can only delete their own reviews)
router.delete("/:reviewId", protect, deleteReview);

// POST: Increment helpful counter for a review (public endpoint)
router.post("/:reviewId/helpful", markHelpful);

// GET: Fetch all reviews without pagination (admin dashboard)
router.get("/getAllReviews", getAllReviewsAdmin);

// GET: Fetch all reviews created by a specific user via userId query param
router.get("/getreviewbyid", getReviewById);

export default router;
