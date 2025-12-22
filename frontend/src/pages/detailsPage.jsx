import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const DetailsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Get the 'data' parameter from URL
      const encodedData = searchParams.get("data");

      if (encodedData) {
        // Decode and parse the JSON data
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

  const handleGoBack = () => {
    // Navigate back to booking page - sessionStorage will restore the state
    navigate("/booking");
  };

  const handleViewReviews = () => {
    // Navigate to reviews page with place data
    const encodedData = encodeURIComponent(JSON.stringify(placeData));
    navigate(`/reviews?data=${encodedData}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!placeData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl text-red-500 mb-4">No data found</div>
        <button
          onClick={handleGoBack}
          className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition"
        >
          Go Back to Booking
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Booking</span>
        </button>

        {/* Photo Gallery - Bento Grid - Full Width at Top */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-2 h-[450px]">
            {/* Large photo on left - takes 2 columns */}
            <div className="col-span-2 row-span-2">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-l-lg overflow-hidden">
                <span className="text-gray-400 text-sm">Photo 1</span>
              </div>
            </div>
            
            {/* Right side - 4 smaller photos in 2x2 grid */}
            <div className="col-span-1">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <span className="text-gray-400 text-sm">Photo 2</span>
              </div>
            </div>
            <div className="col-span-1">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-tr-lg overflow-hidden">
                <span className="text-gray-400 text-sm">Photo 3</span>
              </div>
            </div>
            <div className="col-span-1">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <span className="text-gray-400 text-sm">Photo 4</span>
              </div>
            </div>
            <div className="col-span-1 relative">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-br-lg overflow-hidden">
                <span className="text-gray-400 text-sm">Photo 5</span>
                {/* See all photos button overlayed on last photo */}
                <button className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 shadow-lg border border-gray-300">
                  See all photos (5)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout - Single column */}
        <div className="grid grid-cols-1 gap-6">
          {/* Place Details */}
          <div className="space-y-6">

            {/* Title and Address */}
            <div>
              <p className="text-sm text-gray-600 mb-1">{placeData.categoryLabel}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{placeData.name}</h1>
              <div className="flex items-center gap-2 mb-6">
                <button onClick={handleViewReviews} className="text-blue-600 underline hover:text-blue-700">
                  View all reviews
                </button>
              </div>


              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-6">
                  <button className="pb-3 px-1 border-b-2 border-gray-900 font-semibold text-gray-900">
                    Location details
                  </button>
                  <button 
                    onClick={handleViewReviews}
                    className="pb-3 px-1 text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-teal-500 transition-all"
                  >
                    Reviews
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-gray-900">Description</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{placeData.description}</p>
                
                {/* Bullet points */}
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Beautiful location with stunning views and peaceful surroundings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Close to major attractions and local markets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Perfect for families, couples, and solo travelers</span>
                  </li>
                </ul>
              </div>

              {/* What this place offers */}
              <div className="mb-8 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-900">What this place offers?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏠</span>
                    <span className="text-gray-700 text-sm">1600sq. feet space</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏠</span>
                    <span className="text-gray-700 text-sm">1600sq. feet space</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📍</span>
                    <span className="text-gray-700 text-sm">2.6 mi away from city</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💡</span>
                    <span className="text-gray-700 text-sm">Natural Lighting</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💡</span>
                    <span className="text-gray-700 text-sm">Natural Lighting</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🧹</span>
                    <span className="text-gray-700 text-sm">Cleaning Service</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🐾</span>
                    <span className="text-gray-700 text-sm">Pet Friendly</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🐾</span>
                    <span className="text-gray-700 text-sm">Pet Friendly</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🍽️</span>
                    <span className="text-gray-700 text-sm">Buffet Food</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold mb-3 text-gray-900">Location</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    <span className="font-semibold">Latitude:</span> {placeData.location.lat}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Longitude:</span> {placeData.location.lon}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="mt-8 pt-8">
          <button
            onClick={handleGoBack}
            className="w-full md:w-auto bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition font-semibold shadow-md hover:shadow-lg"
          >
            ← Back to Booking Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
