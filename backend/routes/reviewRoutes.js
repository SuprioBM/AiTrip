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

// POST /api/reviews - create a new review (protected)
router.post("/", protect, createReview);

// GET /api/reviews/location/:locationId - paginated reviews for a location
router.get("/location/:locationId", getLocationReviews);

// PUT /api/reviews/:reviewId - update a review (protected, owner only)
router.put("/:reviewId", protect, updateReview);

// DELETE /api/reviews/:reviewId - delete a review (protected, owner only)
router.delete("/:reviewId", protect, deleteReview);

// POST /api/reviews/:reviewId/helpful - increment helpful count (public)
router.post("/:reviewId/helpful", markHelpful);

// GET /api/reviews/getAllReviews - admin: return all reviews
router.get("/getAllReviews", getAllReviewsAdmin);

// GET /api/reviews/getreviewbyid - return reviews by `userId` query
router.get("/getreviewbyid", getReviewById);

export default router;
