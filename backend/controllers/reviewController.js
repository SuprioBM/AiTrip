import Review from "../models/Review.js";
import User from "../models/User.js";

// Creates new review with location data and authenticated user ID, validates required fields
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

// Fetches paginated reviews for a location with average rating using MongoDB aggregation
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

// Fetches all reviews created by a specific user using userId query parameter
export const getReviewById = async (req, res, next) => {
  try {
    const reviewId = req.query.userId;

    const reviews = await Review.find({ userId: reviewId });

    if (!reviews) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieves all reviews from database without pagination for admin dashboard
export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
      totalReviews: reviews.length,
    });
  } catch (error) {
    next(error);
  }
};

// Updates review rating/comment after ownership verification (users edit own reviews only)
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

// Permanently removes a review after verifying user ownership (users delete own reviews only)
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

// Increments helpful counter for a review (public endpoint accessible to all users)
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
