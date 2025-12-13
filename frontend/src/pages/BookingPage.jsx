import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MapComponent from "../components/MapComponent";
import API from "../api";

// Check for refresh BEFORE component renders
const checkAndClearOnRefresh = () => {
  const navigationEntries = performance.getEntriesByType("navigation");
  const wasRefreshed =
    navigationEntries.length > 0 && navigationEntries[0].type === "reload";

  if (wasRefreshed) {
    // Clear all booking data on refresh
    sessionStorage.removeItem("booking_formData");
    sessionStorage.removeItem("booking_selectedLocation");
    sessionStorage.removeItem("booking_mapMarkers");
    sessionStorage.removeItem("booking_activeCategory");
    sessionStorage.removeItem("booking_stats");
    return true; // Was refreshed
  }
  return false; // Normal navigation
};

// Run check before component definition
const wasPageRefreshed = checkAndClearOnRefresh();

export default function BookingPage() {
  // Initialize from sessionStorage (will be empty if refreshed)
  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem("booking_formData");
      return saved
        ? JSON.parse(saved)
        : {
            location: "",
            travelDate: "",
            budget: "medium",
          };
    } catch {
      return {
        location: "",
        travelDate: "",
        budget: "medium",
      };
    }
  });

  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = sessionStorage.getItem("booking_selectedLocation");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [mapMarkers, setMapMarkers] = useState(() => {
    try {
      const saved = sessionStorage.getItem("booking_mapMarkers");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState(() => {
    return sessionStorage.getItem("booking_activeCategory") || "all";
  });

  const [loadingAI, setLoadingAI] = useState(false);

  const [stats, setStats] = useState(() => {
    try {
      const saved = sessionStorage.getItem("booking_stats");
      return saved
        ? JSON.parse(saved)
        : { places: 0, restaurants: 0, hotels: 0 };
    } catch {
      return { places: 0, restaurants: 0, hotels: 0 };
    }
  });

  // Save to sessionStorage whenever state changes
  useEffect(() => {
    sessionStorage.setItem("booking_formData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (selectedLocation) {
      sessionStorage.setItem(
        "booking_selectedLocation",
        JSON.stringify(selectedLocation)
      );
    }
  }, [selectedLocation]);

  useEffect(() => {
    sessionStorage.setItem("booking_mapMarkers", JSON.stringify(mapMarkers));
  }, [mapMarkers]);

  useEffect(() => {
    sessionStorage.setItem("booking_activeCategory", activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    sessionStorage.setItem("booking_stats", JSON.stringify(stats));
  }, [stats]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit and call backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoadingAI(true);
    setMapMarkers([]);
    setStats({ places: 0, restaurants: 0, hotels: 0 });

    try {
      const { data } = await API.post("/ai/trip-suggestions", {
        location: formData.location,
        budget: formData.budget,
        include: ["places", "restaurants", "hotels"],
      });

      if (data.success) {
        // Set map center
        setSelectedLocation({
          name: data.location,
          lat: data.center.lat,
          lng: data.center.lng,
        });

        // Combine all markers with categories
        const allMarkers = [];

        // Add places
        if (data.places && Array.isArray(data.places)) {
          data.places.forEach((place) => {
            allMarkers.push({
              id: `place_${place.name}`,
              name: place.name,
              description: place.shortDescription || "",
              photos: place.photos || [],
              location: place.location,
              category: "place",
              categoryLabel: "🏛️ Attraction",
              wikipediaUrl: place.wikipediaUrl,
            });
          });
        }

        // Add restaurants
        if (data.restaurants && Array.isArray(data.restaurants)) {
          data.restaurants.forEach((restaurant) => {
            allMarkers.push({
              id: `restaurant_${restaurant.name}`,
              name: restaurant.name,
              description: `${restaurant.cuisine} • ${
                restaurant.shortDescription || ""
              }`,
              photos: restaurant.photos || [],
              location: restaurant.location,
              category: "restaurant",
              categoryLabel: "🍽️ Restaurant",
              budget: restaurant.inferred_budget,
            });
          });
        }

        // Add hotels
        if (data.hotels && Array.isArray(data.hotels)) {
          data.hotels.forEach((hotel) => {
            allMarkers.push({
              id: `hotel_${hotel.name}`,
              name: hotel.name,
              description: hotel.shortDescription || "",
              photos: hotel.photos || [],
              location: hotel.location,
              category: "hotel",
              categoryLabel: "🏨 Hotel",
              stars: hotel.stars,
            });
          });
        }

        setMapMarkers(allMarkers);
        setStats({
          places: data.places?.length || 0,
          restaurants: data.restaurants?.length || 0,
          hotels: data.hotels?.length || 0,
        });

        console.log(`✅ Loaded ${allMarkers.length} markers on map`);
      } else {
        console.error("Backend error:", data.message);
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      alert("Failed to get suggestions. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  // Clear session storage (optional - call after booking complete)
  const clearBookingData = () => {
    sessionStorage.removeItem("booking_formData");
    sessionStorage.removeItem("booking_selectedLocation");
    sessionStorage.removeItem("booking_mapMarkers");
    sessionStorage.removeItem("booking_activeCategory");
    sessionStorage.removeItem("booking_stats");

    setFormData({
      location: "",
      travelDate: "",
      budget: "medium",
    });
    setSelectedLocation(null);
    setMapMarkers([]);
    setActiveCategory("all");
    setStats({ places: 0, restaurants: 0, hotels: 0 });
  };

  // Filter markers by category
  const getFilteredMarkers = () => {
    if (activeCategory === "all") return mapMarkers;
    return mapMarkers.filter((m) => m.category === activeCategory);
  };

  return (
    <div className="min-h-screen bg-white py-23 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Plan Your Trip
          </h1>
          <p className="text-xl text-black">
            Enter your location, date, and budget to get AI trip suggestions
          </p>
        </motion.div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/95 rounded-3xl shadow-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500"
                  placeholder="Enter a city or place"
                />
              </div>

              {/* Travel date */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Travel Date *
                </label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Budget *
                </label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loadingAI}
                whileHover={{ scale: loadingAI ? 1 : 1.02 }}
                className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-all ${
                  loadingAI
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-500 to-blue-500 text-white"
                }`}
              >
                {loadingAI ? "Loading..." : "Get Suggestions"}
              </motion.button>
            </form>

            {/* Stats */}
            {stats.places + stats.restaurants + stats.hotels > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 grid grid-cols-3 gap-4"
              >
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.places}
                  </div>
                  <div className="text-sm text-purple-700">Places</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {stats.restaurants}
                  </div>
                  <div className="text-sm text-orange-700">Restaurants</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.hotels}
                  </div>
                  <div className="text-sm text-blue-700">Hotels</div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/95 rounded-3xl shadow-2xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Destination Map</h2>

              {/* Category Filter */}
              {mapMarkers.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === "all"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveCategory("place")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === "place"
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    🏛️
                  </button>
                  <button
                    onClick={() => setActiveCategory("restaurant")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === "restaurant"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    🍽️
                  </button>
                  <button
                    onClick={() => setActiveCategory("hotel")}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === "hotel"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    🏨
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg max-h-[4000px]">
              <MapComponent
                center={selectedLocation}
                markers={getFilteredMarkers()}
              />
            </div>

            {loadingAI && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-500">
                  Generating trip suggestions...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
