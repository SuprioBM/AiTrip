import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Define the type for your place data
interface PlaceData {
  id: string;
  name: string;
  description: string;
  photos: string[];
  location: {
    lon: number;
    lat: number;
  };
  category: string;
  categoryLabel: string;
  wikipediaUrl?: string;
}

const DetailsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [placeData, setPlaceData] = useState<PlaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Get the 'data' parameter from URL
      const encodedData = searchParams.get("data");

      if (encodedData) {
        // Decode and parse the JSON data
        const decodedData = decodeURIComponent(encodedData);
        const parsedData = JSON.parse(decodedData) as PlaceData;
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
    <div className="max-w-4xl mx-auto p-6 py-30">
      {/* Back Button */}
      <button
        onClick={handleGoBack}
        className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">Back to Booking</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <span className="text-2xl">{placeData.categoryLabel}</span>
        <h1 className="text-4xl font-bold mt-2">{placeData.name}</h1>
      </div>

      {/* Photos */}
      {placeData.photos && placeData.photos.length > 0 && (
        <div className="mb-6">
          <img
            src={placeData.photos[0]}
            alt={placeData.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">About</h2>
        <p className="text-gray-700 leading-relaxed">{placeData.description}</p>
      </div>

      {/* Location */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Location</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">
            <span className="font-semibold">Latitude:</span>{" "}
            {placeData.location.lat}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Longitude:</span>{" "}
            {placeData.location.lon}
          </p>
        </div>
      </div>

      {/* Wikipedia Link */}
      {placeData.wikipediaUrl && (
        <div className="mb-6">
          <a
            href={placeData.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition shadow-md hover:shadow-lg"
          >
            Read more on Wikipedia →
          </a>
        </div>
      )}

      {/* All Photos Gallery */}
      {placeData.photos && placeData.photos.length > 1 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {placeData.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`${placeData.name} ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <button
          onClick={handleGoBack}
          className="w-full md:w-auto bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition font-semibold shadow-md hover:shadow-lg"
        >
          ← Back to Booking Page
        </button>
      </div>
    </div>
  );
};

export default DetailsPage;
