import Review from "../models/Review.js";
import User from "../models/User.js";

/**
 * Create a new review for a location
 * Allows multiple reviews per user
 */
export const createReview = async (req, res, next) => {
  try {
    const { locationId, locationName, rating, comment } = req.body;

    // Validate required fields
    if (!locationId || !locationName || !rating || !comment) {
      return res.status(400).json({
        message: "Please provide locationId, locationName, rating, and comment",
      });
    }

    // Create review with user ID from auth middleware
    const review = await Review.create({
      userId: req.user._id,
      locationId,
      locationName,
      rating,
      comment,
      targetType: "location",
    });

    // Populate user information
    await review.populate("userId", "name email");

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated reviews for a specific location
 * Includes average rating calculation and pagination metadata
 */
export const getLocationReviews = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalReviews = await Review.countDocuments({ locationId });

    // Get paginated reviews
    const reviews = await Review.find({ locationId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate average rating using aggregation
    const ratingStats = await Review.aggregate([
      { $match: { locationId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      ratingStats.length > 0 ? ratingStats[0].averageRating : 0;

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        limit,
        hasNextPage: page * limit < totalReviews,
        hasPrevPage: page > 1,
      },
      averageRating: averageRating.toFixed(1),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing review (rating and/or comment)
 * Only allows users to update their own reviews
 */
export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user owns this review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update your own reviews" });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();
    await review.populate("userId", "name email");

    res.json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review permanently
 * Only allows users to delete their own reviews
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user owns this review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own reviews" });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a review as helpful
 * Any user can mark a review as helpful (public endpoint)
 */
export const markHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.helpful = (review.helpful || 0) + 1;
    await review.save();

    res.json({
      success: true,
      helpful: review.helpful,
    });
  } catch (error) {
    next(error);
  }
};
