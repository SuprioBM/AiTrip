import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import MapComponent from "../components/MapComponent";
import API from "../api";
import { toast } from "sonner";
import { Plus, X, Users, Calendar, DollarSign, Clock } from "lucide-react";

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
  const { user } = useAuth();
  console.log(user);

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

  const [showPartnerUpForm, setShowPartnerUpForm] = useState(false);
  const [partnerUpData, setPartnerUpData] = useState({
    numberOfPeople: 2,
    budgetMin: 1000,
    budgetMax: 5000,
    numberOfDays: 3,
    startDate: "",
    endDate: "",
  });
  const [matchingPartners, setMatchingPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [myPartnerUp, setMyPartnerUp] = useState(null);
  const [localhosts, setLocalhosts] = useState([]);
  const [selectedLocalhost, setSelectedLocalhost] = useState(null);
  const [loadingLocalhosts, setLoadingLocalhosts] = useState(false);

  // Additional trip details
  const [tripDetails, setTripDetails] = useState({
    startDate: "",
    endDate: "",
    numberOfDays: 0,
    budget: 0,
  });
  const [savingTrip, setSavingTrip] = useState(false);

  const searchPartners = async (lat, lon) => {
    // Search partner-ups by coordinates (preferred) or by selectedLocation
    const useLat = typeof lat === "number" || (lat && !isNaN(Number(lat)));
    const useLon = typeof lon === "number" || (lon && !isNaN(Number(lon)));

    // If no explicit coords passed, fall back to selectedLocation
    if (!useLat || !useLon) {
      if (!selectedLocation) return;
    }

    setLoadingPartners(true);
    try {
      const token = localStorage.getItem("token");

      const placeId =
        useLat && useLon
          ? `${lat}_${lon}`
          : `${selectedLocation.lat}_${selectedLocation.lng}`;

      const payload = {
        placeId,
        location:
          useLat && useLon
            ? { lat: Number(lat), lon: Number(lon) }
            : { lat: selectedLocation.lat, lon: selectedLocation.lng },
      };

      // Add dates if available
      if (formData.travelDate) {
        payload.startDate = formData.travelDate;
        payload.endDate = formData.travelDate;
      }

      console.log("Searching for partners with:", payload);

      const { data } = await API.post("/partnerup/search", payload, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      if (data && data.success) {
        setMatchingPartners(data.data || []);
      } else {
        setMatchingPartners([]);
      }
    } catch (error) {
      console.error("Error searching partners:", error);
      setMatchingPartners([]);
    } finally {
      setLoadingPartners(false);
    }
  };

  // Update number of days when dates change
  useEffect(() => {
    if (tripDetails.startDate && tripDetails.endDate) {
      const days = calculateDays(tripDetails.startDate, tripDetails.endDate);
      setTripDetails((prev) => ({ ...prev, numberOfDays: days }));
    }
  }, [tripDetails.startDate, tripDetails.endDate]);

  // Calculate days between dates
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Assign localhost to trip
  const handleAssignLocalhost = async (host) => {
    if (!user) {
      toast.error("Please login to assign localhost");
      return;
    }

    if (!selectedLocation) {
      toast.error("Please select a location first");
      return;
    }

    setSavingTrip(true);
    try {
      // Create unique placeId combining location and localhost
      const locationCode = selectedLocation.name
        .substring(0, 4)
        .toLowerCase()
        .replace(/\s/g, "");
      const uniquePlaceId = `${locationCode}_${host._id}_${Date.now()}`;

      const tripData = {
        locationName: selectedLocation.name,
        placeId: uniquePlaceId,
        selectedPins: mapMarkers,
        destination: selectedLocation.name,
        localhost: host._id,
        localhostName: host.name,
      };

      console.log("Assigning localhost to trip:", tripData);
      const { data } = await API.post("/trips", tripData);
      console.log("Response:", data);

      if (data.trip) {
        toast.success(
          `Localhost "${host.name}" assigned to your trip successfully! View it in your dashboard.`
        );
      }
    } catch (error) {
      console.error("Error assigning localhost:", error);
      console.error("Error response:", error.response?.data);
      const errorMsg = error.response?.data?.message || error.message;

      if (errorMsg.includes("duplicate") || errorMsg.includes("unique")) {
        toast.error(
          "You have already created a trip for this location with this localhost. Check your dashboard."
        );
      } else {
        toast.error(`Failed to assign localhost: ${errorMsg}`);
      }
    } finally {
      setSavingTrip(false);
    }
  };

  // Fetch localhosts by location
  const fetchLocalhosts = async () => {
    if (!selectedLocation) return;

    setLoadingLocalhosts(true);
    try {
      // Extract first 3 letters of location name
      const locationCode = selectedLocation.name
        ? selectedLocation.name.toLowerCase().substring(0, 3)
        : "unk";

      console.log("🔍 Fetching localhosts for location code:", locationCode);

      const { data } = await API.get(`/hosts/${locationCode}`);

      console.log("✅ Localhosts fetched:", data);
      setLocalhosts(data.data || []);
    } catch (error) {
      console.error("Error fetching localhosts:", error);
      setLocalhosts([]);
    } finally {
      setLoadingLocalhosts(false);
    }
  };

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
      console.log(data);

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
        //call partnerup search fucntion here based on coordinates lat-lan , if exist then it will show on the partnerup section
        searchPartners();
        console.log(`✅ Loaded ${allMarkers.length} markers on map`);
      } else {
        console.error("Backend error:", data.message);
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast.error("Failed to get suggestions. Please try again.");
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

  // Handle PartnerUp form changes
  const handlePartnerUpChange = (e) => {
    const { name, value } = e.target;
    setPartnerUpData((prev) => ({
      ...prev,
      [name]:
        name.includes("budget") || name.includes("number")
          ? parseInt(value) || 0
          : value,
    }));
  };

  // Create PartnerUp
  const handleCreatePartnerUp = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      toast.error("Please search for a location first");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await API.post(
        "/partnerup/create",
        {
          placeId: `${selectedLocation.lat}_${selectedLocation.lng}`,
          placeName: selectedLocation.name,
          location: {
            lat: selectedLocation.lat,
            lon: selectedLocation.lng,
          },
          numberOfPeople: partnerUpData.numberOfPeople,
          budgetRange: {
            min: partnerUpData.budgetMin,
            max: partnerUpData.budgetMax,
          },
          numberOfDays: partnerUpData.numberOfDays,
          startDate: partnerUpData.startDate,
          endDate: partnerUpData.endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setMyPartnerUp(data.data);
        setShowPartnerUpForm(false);
        toast.success("PartnerUp created successfully!");
        // Search for matching partners
        searchPartners();
      }
    } catch (error) {
      console.error("Error creating PartnerUp:", error);
      toast.error(
        error.response?.data?.message || "Failed to create PartnerUp"
      );
    }
  };

  // Search for matching partners is implemented above (supports coords or selectedLocation)

  // Send partner request (include place snapshot)
  const handleSendPartnerRequest = async (partnerUpId, partner) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        placeName:
          (partner && partner.placeName) ||
          (selectedLocation && selectedLocation.name),
        location:
          (partner && partner.location) ||
          (selectedLocation && {
            lat: selectedLocation.lat,
            lon: selectedLocation.lng,
          }),
      };

      const { data } = await API.post(
        `/partnerup/request/${partnerUpId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data && data.success) {
        toast.success("Partner request sent successfully!");
      }
    } catch (error) {
      console.error("Error sending partner request:", error);
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  // Search for partners when location changes - remove date dependency for better matching
  useEffect(() => {
    if (selectedLocation) {
      searchPartners();
      fetchLocalhosts(); // Fetch localhosts when location changes
    }
  }, [selectedLocation]);

  // Also search when travel date changes
  useEffect(() => {
    if (selectedLocation && formData.travelDate) {
      searchPartners();
    }
  }, [formData.travelDate]);

  return (
    <div className="min-h-screen bg-white py-23 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Plan Your Trip
            </h1>
          </div>
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

            {/* PartnerUp Section */}
            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 border-t pt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-500" />
                    Partner Up
                  </h3>
                  {!myPartnerUp && (
                    <button
                      onClick={() => setShowPartnerUpForm(true)}
                      className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Create
                    </button>
                  )}
                </div>

                {/* My PartnerUp */}
                {myPartnerUp && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-teal-700">
                        Your Trip Plan
                      </span>
                      <span className="text-xs bg-teal-500 text-white px-2 py-1 rounded-full">
                        {myPartnerUp.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-teal-800">
                      <p>👥 {myPartnerUp.numberOfPeople} people</p>
                      <p>
                        💰 ${myPartnerUp.budgetRange.min} - $
                        {myPartnerUp.budgetRange.max}
                      </p>
                      <p>📅 {myPartnerUp.numberOfDays} days</p>
                    </div>
                  </div>
                )}

                {/* Matching Partners */}
                <div className="space-y-3">
                  {loadingPartners ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-500 border-t-transparent"></div>
                    </div>
                  ) : matchingPartners.length > 0 ? (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        Found {matchingPartners.length} potential travel
                        partner(s)
                      </p>
                      {matchingPartners.map((partner) => (
                        <div
                          key={partner._id}
                          className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-teal-500 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  partner.createdBy.profilePic ||
                                  `https://ui-avatars.com/api/?name=${partner.createdBy.name}&background=0D8ABC&color=fff&size=48`
                                }
                                alt={partner.createdBy.name}
                                className="w-12 h-12 rounded-full border-2 border-teal-500"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {partner.createdBy.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {partner.placeName}
                                </p>
                              </div>
                            </div>
                            {user.id !== partner.createdBy._id && (
                              <button
                                onClick={() =>
                                  handleSendPartnerRequest(partner._id, partner)
                                }
                                className="w-8 h-8 flex items-center justify-center bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {partner.numberOfPeople} people
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />$
                              {partner.budgetRange.min}-$
                              {partner.budgetRange.max}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {partner.numberOfDays} days
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(partner.startDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {selectedLocation
                        ? "No matching partners yet. Be the first to create a trip plan!"
                        : "Search for a location to find travel partners"}
                    </div>
                  )}
                </div>

                {/* Local Host Section */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-bold mb-4">Local Host</h3>
                  {loadingLocalhosts ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Loading localhosts...
                    </div>
                  ) : localhosts.length > 0 ? (
                    <div className="space-y-3">
                      {localhosts.map((host) => (
                        <div
                          key={host._id}
                          className="p-4 rounded-xl transition-all border-2 border-gray-200 hover:border-teal-300 bg-white"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {host.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {host.locationName}
                              </p>
                              {host.email && (
                                <p className="text-xs text-gray-500 mt-2">
                                  📧 {host.email}
                                </p>
                              )}
                              {host.phone && (
                                <p className="text-xs text-gray-500">
                                  📱 {host.phone}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleAssignLocalhost(host)}
                              disabled={savingTrip}
                              className="ml-4 p-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:opacity-90 disabled:opacity-50 text-white rounded-lg transition-all"
                              title="Assign this localhost to trip"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {selectedLocation
                        ? "No local hosts available for this location yet"
                        : "Search for a location to find local hosts"}
                    </div>
                  )}
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

      {/* PartnerUp Form Modal */}
      {showPartnerUpForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create Trip Plan</h2>
              <button
                onClick={() => setShowPartnerUpForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePartnerUp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Number of People
                </label>
                <input
                  type="number"
                  name="numberOfPeople"
                  value={partnerUpData.numberOfPeople}
                  onChange={handlePartnerUpChange}
                  min="1"
                  max="20"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Min Budget ($)
                  </label>
                  <input
                    type="number"
                    name="budgetMin"
                    value={partnerUpData.budgetMin}
                    onChange={handlePartnerUpChange}
                    min="0"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Max Budget ($)
                  </label>
                  <input
                    type="number"
                    name="budgetMax"
                    value={partnerUpData.budgetMax}
                    onChange={handlePartnerUpChange}
                    min="0"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Number of Days
                </label>
                <input
                  type="number"
                  name="numberOfDays"
                  value={partnerUpData.numberOfDays}
                  onChange={handlePartnerUpChange}
                  min="1"
                  max="365"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={partnerUpData.startDate}
                    onChange={handlePartnerUpChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={partnerUpData.endDate}
                    onChange={handlePartnerUpChange}
                    min={
                      partnerUpData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPartnerUpForm(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold hover:shadow-lg transition"
                >
                  Create Trip Plan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
