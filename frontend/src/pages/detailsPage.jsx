import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  Check,
} from "lucide-react";
import axios from "axios";

const DetailsPage = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Place data from URL params
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab navigation: "details" or "reviews"
  const [activeTab, setActiveTab] = useState("details");

  // Review data
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  // New review form
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  // Edit review functionality
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedReview, setEditedReview] = useState({ rating: 5, comment: "" });
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load more tracking
  const [loadMoreCount, setLoadMoreCount] = useState(0);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // ============================================================================
  // EFFECT: Load place data from URL on component mount
  // ============================================================================
  useEffect(() => {
    try {
      const encodedData = searchParams.get("data");
      if (encodedData) {
        const decodedData = decodeURIComponent(encodedData);
        const parsedData = JSON.parse(decodedData);
        setPlaceData(parsedData);
      }
    } catch (error) {
      console.error("Error parsing URL data:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // ============================================================================
  // FUNCTION: fetchReviews - Fetch paginated reviews for current location
  // ============================================================================
  const fetchReviews = async (limit, append = false) => {
    if (!placeData) return;

    try {
      const locationId = placeData.xid || placeData.locationId || placeData.id;
      if (locationId) {
        const response = await axios.get(
          `http://localhost:5000/api/reviews/location/${locationId}?page=1&limit=${limit}`
        );

        if (append) {
          setReviews((prevReviews) => [...prevReviews, ...response.data.reviews]);
        } else {
          setReviews(response.data.reviews);
        }
        setPagination(response.data.pagination);
        setAverageRating(response.data.averageRating || 0);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // ============================================================================
  // EFFECT: Load reviews and user ID when Reviews tab is active
  // ============================================================================
  useEffect(() => {
    if (activeTab === "reviews" && placeData) {
      setLoadMoreCount(0);
      fetchReviews(2);

      // Extract user ID from JWT token
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserId(payload.userId || payload.id || payload._id);
        } catch (error) {
          console.error("Error parsing token:", error);
        }
      }
    }
  }, [activeTab, placeData]);

  // ============================================================================
  // FUNCTION: handleSubmitReview - Submit a new review
  // ============================================================================
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!newReview.comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to submit a review");
        navigate("/login");
        return;
      }

      const locationId = placeData.xid || placeData.locationId || placeData.id;

      await axios.post(
        "http://localhost:5000/api/reviews",
        {
          locationId: locationId,
          locationName: placeData.name,
          rating: newReview.rating,
          comment: newReview.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset form
      setNewReview({ rating: 5, comment: "" });

      // Refresh reviews - load based on current state
      const currentLimit = loadMoreCount === 0 ? 2 : loadMoreCount === 1 ? 5 : pagination.totalReviews;
      fetchReviews(currentLimit);

      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error.response?.status === 401) {
        alert("Please login to submit a review");
        navigate("/login");
      } else if (error.response?.status === 400) {
        alert(error.response.data.message || "Error submitting review");
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================================
  // FUNCTION: handleLoadMore - Load more reviews with progressive loading
  // ============================================================================
  const handleLoadMore = () => {
    if (loadMoreCount === 0) {
      // First click: show 2 + 3 = 5 reviews
      fetchReviews(5);
      setLoadMoreCount(1);
    } else if (loadMoreCount === 1) {
      // Second click: show all reviews
      fetchReviews(pagination.totalReviews);
      setLoadMoreCount(2);
    }
  };

  // ============================================================================
  // FUNCTION: handleMarkHelpful - Increment helpful counter for a review
  // ============================================================================
  const handleMarkHelpful = async (reviewId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/reviews/${reviewId}/helpful`
      );
      const currentLimit = loadMoreCount === 0 ? 2 : loadMoreCount === 1 ? 5 : pagination.totalReviews;
      fetchReviews(currentLimit);
    } catch (error) {
      console.error("Error marking helpful:", error);
    }
  };

  // ============================================================================
  // FUNCTION: handleEditClick - Enter edit mode for a review
  // ============================================================================
  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setEditedReview({
      rating: review.rating,
      comment: review.comment,
    });
  };

  // ============================================================================
  // FUNCTION: handleCancelEdit - Cancel editing and return to view mode
  // ============================================================================
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditedReview({ rating: 5, comment: "" });
  };

  // ============================================================================
  // FUNCTION: handleUpdateReview - Save changes to an edited review
  // ============================================================================
  const handleUpdateReview = async (reviewId) => {
    if (!editedReview.comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to update review");
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/reviews/${reviewId}`,
        {
          rating: editedReview.rating,
          comment: editedReview.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingReviewId(null);
      setEditedReview({ rating: 5, comment: "" });
      const currentLimit = loadMoreCount === 0 ? 2 : loadMoreCount === 1 ? 5 : pagination.totalReviews;
      fetchReviews(currentLimit);
      alert("Review updated successfully!");
    } catch (error) {
      console.error("Error updating review:", error);
      if (error.response?.status === 401) {
        alert("Please login to update review");
        navigate("/login");
      } else if (error.response?.status === 403) {
        alert("You can only update your own reviews");
      } else {
        alert("Failed to update review. Please try again.");
      }
    }
  };

  // ============================================================================
  // FUNCTION: handleDeleteReview - Delete a review
  // ============================================================================
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to delete review");
        navigate("/login");
        return;
      }

      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const currentLimit = loadMoreCount === 0 ? 2 : loadMoreCount === 1 ? 5 : pagination.totalReviews;
      fetchReviews(currentLimit);
      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      if (error.response?.status === 401) {
        alert("Please login to delete review");
        navigate("/login");
      } else if (error.response?.status === 403) {
        alert("You can only delete your own reviews");
      } else {
        alert("Failed to delete review. Please try again.");
      }
    }
  };

  // ============================================================================
  // FUNCTION: renderStars - Display star rating (static or interactive)
  // ============================================================================
  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            onClick={() => interactive && onChange && onChange(star)}
            className={`w-${interactive ? "6" : "4"} h-${
              interactive ? "6" : "4"
            } ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }`}
          />
        ))}
      </div>
    );
  };

  // ============================================================================
  // FUNCTION: formatDate - Format ISO date string to readable format
  // ============================================================================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE - No data found
  // ============================================================================
  if (!placeData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl text-red-500 mb-4">No data found</div>
        <button
          onClick={() => navigate("/booking")}
          className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition"
        >
          Go Back to Booking
        </button>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/booking")}
          className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Booking</span>
        </button>

        {/* Photo Gallery - Bento Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-2 h-[400px]">
            {/* Large photo on left */}
            <div className="col-span-2 row-span-2">
              <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center rounded-lg overflow-hidden border border-gray-200">
                <span className="text-gray-400 text-sm">Photo Gallery</span>
              </div>
            </div>

            {/* Right side - 4 smaller photos in 2x2 grid */}
            {[2, 3, 4, 5].map((num) => (
              <div key={num} className="col-span-1">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center rounded-lg overflow-hidden border border-gray-200">
                  <span className="text-gray-400 text-xs">Photo {num}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Title Section */}
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {placeData.categoryLabel || "Location"}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {placeData.name}
            </h1>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`pb-3 px-1 font-medium transition-all ${
                    activeTab === "details"
                      ? "border-b-2 border-teal-500 text-teal-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Location Details
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 px-1 font-medium transition-all ${
                    activeTab === "reviews"
                      ? "border-b-2 border-teal-500 text-teal-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Reviews ({pagination.totalReviews})
                </button>
              </div>
            </div>
          </div>

          {/* DETAILS TAB */}
          {activeTab === "details" && (
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-xl font-bold mb-3 text-gray-900">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {placeData.description ||
                    "Discover this amazing location with unique features and attractions."}
                </p>

                {/* Bullet points */}
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-3 text-teal-500">•</span>
                    <span>Beautiful location with stunning views</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-teal-500">•</span>
                    <span>Close to major attractions and local markets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-teal-500">•</span>
                    <span>Perfect for families, couples, and solo travelers</span>
                  </li>
                </ul>
              </div>

              {/* Amenities */}
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  What this place offers?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: "🏠", text: "Spacious area" },
                    { icon: "📍", text: "Strategic location" },
                    { icon: "💡", text: "Natural Lighting" },
                    { icon: "🧹", text: "Cleaning Service" },
                    { icon: "🐾", text: "Pet Friendly" },
                    { icon: "🍽️", text: "Food Services" },
                  ].map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-2xl">{amenity.icon}</span>
                      <span className="text-gray-700">{amenity.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold mb-3 text-gray-900">
                  Location
                </h2>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  {placeData.location ? (
                    <>
                      <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Latitude:</span>{" "}
                        {placeData.location.lat}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Longitude:</span>{" "}
                        {placeData.location.lon}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">Location details unavailable</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <div className="space-y-8">
              {/* Average Rating */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-5xl font-bold text-gray-900">
                      {averageRating}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">
                      {pagination.totalReviews} reviews
                    </p>
                  </div>
                </div>
              </div>

              {/* New Review Form */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-gray-900">
                  Share Your Experience
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating Stars */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {renderStars(newReview.rating, true, (rating) =>
                        setNewReview({ ...newReview, rating })
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      placeholder="Share your experience at this location..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      rows="4"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  <>
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white p-6 rounded-lg border border-gray-200"
                      >
                        {/* Editing Mode */}
                        {editingReviewId === review._id ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-bold text-gray-900">
                                Edit Review
                              </h4>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Edit Rating */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating
                              </label>
                              <div className="flex gap-2">
                                {renderStars(editedReview.rating, true, (rating) =>
                                  setEditedReview({ ...editedReview, rating })
                                )}
                              </div>
                            </div>

                            {/* Edit Comment */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Review
                              </label>
                              <textarea
                                value={editedReview.comment}
                                onChange={(e) =>
                                  setEditedReview({
                                    ...editedReview,
                                    comment: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                rows="3"
                              />
                            </div>

                            {/* Save/Cancel Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleUpdateReview(review._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* View Mode */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {review.userId?.name || "Anonymous"}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>

                              {/* Edit/Delete Buttons */}
                              {currentUserId === review.userId?._id && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditClick(review)}
                                    className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                    title="Edit review"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteReview(review._id)
                                    }
                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete review"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Rating */}
                            <div className="mb-2">
                              {renderStars(review.rating)}
                            </div>

                            {/* Comment */}
                            <p className="text-gray-700 mb-4">
                              {review.comment}
                            </p>

                            {/* Helpful Button */}
                            <button
                              onClick={() => handleMarkHelpful(review._id)}
                              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors group"
                            >
                              <ThumbsUp className="w-4 h-4 group-hover:fill-teal-600" />
                              <span className="text-sm">
                                Helpful
                                {review.helpful > 0 && ` (${review.helpful})`}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Load More Button */}
                    {loadMoreCount < 2 && reviews.length < pagination.totalReviews && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={handleLoadMore}
                          className="px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <ChevronLeft className="w-5 h-5 rotate-[-90deg]" />
                          {loadMoreCount === 0 ? 'See More (3 reviews)' : 'See All Reviews'}
                        </button>
                      </div>
                    )}
                    
                    {/* Showing count */}
                    {reviews.length > 0 && (
                      <div className="text-center mt-4">
                        <p className="text-sm text-gray-500">
                          Showing {reviews.length} of {pagination.totalReviews} reviews
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No reviews yet. Be the first to review!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Back Button */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={() => navigate("/booking")}
              className="w-full bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition font-semibold shadow-md hover:shadow-lg"
            >
              ← Back to Booking Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
