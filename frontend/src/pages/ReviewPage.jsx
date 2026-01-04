import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ThumbsUp } from "lucide-react";
import API from "../api";
const ReviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placeData, setPlaceData] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Get the encoded place data from the URL search params.
        // Expected to be an encoded JSON string that contains at least
        // a `locationId` or `id` field to fetch reviews for.
        const encodedData = searchParams.get("data");
        if (encodedData) {
          const decodedData = decodeURIComponent(encodedData);
          const parsedData = JSON.parse(decodedData);
          setPlaceData(parsedData);

          // Fetch reviews based on location ID
          const locationId = parsedData.locationId || parsedData.id;
          if (locationId) {
            const response = await API.get(`/reviews/location/${locationId}`);
            setReviews(response.data);

            // Compute a simple average rating for display purposes.
            if (response.data.length > 0) {
              const avg =
                response.data.reduce((sum, review) => sum + review.rating, 0) /
                response.data.length;
              setAverageRating(avg.toFixed(1));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [searchParams]);

  const handleGoBack = () => {
    if (placeData) {
      const encodedData = encodeURIComponent(JSON.stringify(placeData));
      navigate(`/details?data=${encodedData}`);
    } else {
      navigate(-1);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back button: navigates to the details page preserving the encoded data */}
        <button
          onClick={handleGoBack}
          className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Details</span>
        </button>

        {/* Header: shows place name, category and average rating */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {placeData && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reviews for {placeData.name}
              </h1>
              <p className="text-gray-600 mb-4">{placeData.categoryLabel}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">
                {averageRating || "No ratings yet"}
              </span>
            </div>
            <span className="text-gray-600">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        {/* Reviews list: iterates over fetched reviews and renders UI for each */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">
                No reviews yet. Be the first to review this place!
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Review header: avatar, author name, post date, and star rating */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {review.userId?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.userId?.name || "Anonymous User"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div>{renderStars(review.rating)}</div>
                </div>

                {/* Review content: user comment text */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>

                {/* Review footer: helpful button and verified badge (if present) */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">Helpful</span>
                  </button>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Verified Booking
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Back Button */}
        <div className="mt-8">
          <button
            onClick={handleGoBack}
            className="w-full md:w-auto bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition font-semibold shadow-md hover:shadow-lg"
          >
            ← Back to Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
