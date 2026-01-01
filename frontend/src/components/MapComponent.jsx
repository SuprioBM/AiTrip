import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import { toast } from "sonner";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create custom colored markers
const createCustomIcon = (category, isSelected = false) => {
  const colors = {
    place: "#9333EA",
    restaurant: "#F97316",
    hotel: "#3B82F6",
    default: "#14B8A6",
  };

  const color = colors[category] || colors.default;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${isSelected ? "32px" : "24px"};
        height: ${isSelected ? "32px" : "24px"};
        border-radius: 50%;
        background-color: ${color};
        border: ${isSelected ? "4px solid #fbbf24" : "3px solid white"};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
      ">
        ${
          isSelected
            ? '<div style="position: absolute; top: -8px; right: -8px; background: #fbbf24; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">✓</div>'
            : ""
        }
      </div>
    `,
    iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
    iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
    popupAnchor: [0, isSelected ? -16 : -12],
  });
};

// User location marker (red pin)
const createUserIcon = () => {
  return L.divIcon({
    className: "user-marker",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #EF4444;
        border: 4px solid white;
        box-shadow: 0 3px 10px rgba(239, 68, 68, 0.5);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">📍</div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export default function MapComponent({ center, markers = [], userData = {} }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markerInstancesRef = useRef({});
  const userMarkerRef = useRef(null);
  const routingControlRef = useRef(null);
  const routeLayerRef = useRef(null);
  const { user } = useAuth();

  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [savingTrip, setSavingTrip] = useState(false);

  // Helper function to generate placeId
  const generatePlaceId = (places) => {
    if (places.length > 0) {
      const firstPlace = places[0];
      const lat = Math.round(firstPlace.location.lat * 100);
      const lon = Math.round(firstPlace.location.lon * 100);
      return `trip_${lat}_${lon}`;
    }
    return `trip_${Date.now()}`;
  };

  // Get place type label
  const getPlaceType = (category) => {
    const types = {
      place: "Attraction",
      restaurant: "Restaurant",
      hotel: "Hotel",
    };
    return types[category] || "Place";
  };

  // Toggle place selection
  const togglePlaceSelection = (place) => {
    setSelectedPlaces((prev) => {
      const isAlreadySelected = prev.some(
        (p) => p.name === place.name && p.location.lat === place.location.lat
      );

      if (isAlreadySelected) {
        return prev.filter(
          (p) =>
            !(p.name === place.name && p.location.lat === place.location.lat)
        );
      } else {
        return [...prev, place];
      }
    });
  };

  // Remove place from selection
  const removePlace = (place) => {
    setSelectedPlaces((prev) =>
      prev.filter(
        (p) => !(p.name === place.name && p.location.lat === place.location.lat)
      )
    );
  };

  // Check if place is selected
  const isPlaceSelected = (place) => {
    return selectedPlaces.some(
      (p) => p.name === place.name && p.location.lat === place.location.lat
    );
  };

  // Save trip to backend
  const saveTrip = async () => {
    if (selectedPlaces.length === 0) {
      toast.error("Please select at least one place to save your trip!");
      return;
    }

    // Check if user is logged in
    if (!user || !user.id) {
      toast.error("Please login to save your trip!");
      return;
    }

    setSavingTrip(true);

    try {
      // Format selectedPins according to backend schema
      const formattedPins = selectedPlaces.map((place) => ({
        category: place.category,
        name: place.name,
        location: {
          lat: place.location.lat,
          lon: place.location.lon,
        },
        photos: place.photos || [],
        shortDescription: place.description || "",
        wikipediaUrl: place.wikipediaUrl || null,
      }));

      // Extract location name from first place or use a default
      const locationName = center.name || "My Trip";

      // Generate placeId
      const placeId = generatePlaceId(selectedPlaces);

      // Prepare trip data
      const tripData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        locationName,
        placeId,
        selectedPins: formattedPins,
      };

      // ✅ Use your API instance instead of fetch
      const response = await API.post("/trip", tripData);

      toast.success(
        `✅ Trip saved successfully!\n\n` +
          `📍 Location: ${response.data.trip.locationName}\n` +
          `📌 Places: ${response.data.trip.selectedPins.length}\n` +
          `🆔 Trip ID: ${response.data.trip._id}`
      );
      setSelectedPlaces([]);
    } catch (error) {
      console.error("Error saving trip:", error);

      // Axios error handling
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to save trip";
      toast.error(`❌ Failed to save trip: ${errorMessage}`);
    } finally {
      setSavingTrip(false);
    }
  };

  // Navigate to detail page with all data
  const showMoreDetails = (place) => {
    // Encode the entire place data as URL-safe JSON
    const encodedData = encodeURIComponent(JSON.stringify(place));

    // Option 1: Using query parameter
    window.location.href = `/details?data=${encodedData}`;

    // Option 2: Using React Router with state (if you're using React Router)
    // navigate('/place-details', { state: { placeData: place } });

    // Option 3: Using sessionStorage (alternative approach)
    // sessionStorage.setItem('selectedPlace', JSON.stringify(place));
    // window.location.href = '/place-details';
  };

  // Get user's current location
  const getUserLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          setLoadingLocation(false);

          // Add user marker to map
          if (mapInstanceRef.current && markersLayerRef.current) {
            if (userMarkerRef.current) {
              userMarkerRef.current.remove();
            }

            userMarkerRef.current = L.marker([userPos.lat, userPos.lng], {
              icon: createUserIcon(),
            })
              .bindPopup(
                `
                <div style="text-align: center; padding: 8px;">
                  <strong style="color: #EF4444; font-size: 14px;">📍 Your Location</strong>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">
                    ${userPos.lat.toFixed(4)}, ${userPos.lng.toFixed(4)}
                  </p>
                </div>
              `
              )
              .addTo(markersLayerRef.current);

            mapInstanceRef.current.setView([userPos.lat, userPos.lng], 13);
          }
        },
        (error) => {
          setLoadingLocation(false);
          console.error("Error getting location:", error);
          toast.error(
            "Could not get your location. Please enable location services."
          );
        }
      );
    } else {
      setLoadingLocation(false);
      toast.error("Geolocation is not supported by your browser");
    }
  };

  // Show route from user location to destination
  const showRoute = async (destination) => {
    if (!userLocation) {
      toast.error("Please enable your location first!");
      return;
    }

    console.log("Showing route to:", destination.name);
    setLoadingRoute(true);

    // Clear existing route
    clearRoute();

    setSelectedDestination(destination);

    try {
      // Use OSRM routing service
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${destination.location.lon},${destination.location.lat}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;

        // Convert coordinates to Leaflet format [lat, lng]
        const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);

        // Create route line
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }

        routeLayerRef.current = L.polyline(latLngs, {
          color: "#3B82F6",
          weight: 6,
          opacity: 0.8,
          lineJoin: "round",
        }).addTo(mapInstanceRef.current);

        // Fit map to show full route
        mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), {
          padding: [50, 50],
        });

        // Set route info
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(2), // Convert to km
          duration: Math.round(route.duration / 60), // Convert to minutes
        });

        console.log("Route created successfully");
      } else {
        console.error("No route found");
        toast.error("Could not find a route to this location.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      toast.error("Failed to calculate route. Please try again.");
    } finally {
      setLoadingRoute(false);
    }
  };

  // Clear route
  const clearRoute = () => {
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    setSelectedDestination(null);
    setRouteInfo(null);
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: center || [20, 0],
      zoom: center ? 13 : 2,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center when it changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], 13, {
        animate: true,
      });
    }
  }, [center]);

  // Update markers when they change or selection changes
  useEffect(() => {
    if (!markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    markerInstancesRef.current = {};

    // Re-add user marker if it exists
    if (userMarkerRef.current) {
      userMarkerRef.current.addTo(markersLayerRef.current);
    }

    markers.forEach((marker) => {
      const isSelected = isPlaceSelected(marker);
      const leafletMarker = L.marker(
        [marker.location.lat, marker.location.lon],
        {
          icon: createCustomIcon(marker.category, isSelected),
        }
      );

      const popupContent = document.createElement("div");
      popupContent.style.maxWidth = "300px";
      popupContent.style.fontFamily = "system-ui, -apple-system, sans-serif";

      popupContent.innerHTML = `
        <div style="max-height: 450px; overflow-y: auto;">
          <div style="display: flex; align-items: start; justify-content: space-between; gap: 8px; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #1f2937; line-height: 1.3;">
              ${marker.name}
            </h3>
            <span style="font-size: 11px; background: #f3f4f6; padding: 4px 8px; border-radius: 12px; white-space: nowrap;">
              ${marker.categoryLabel}
            </span>
          </div>

          ${
            marker.photos && marker.photos.length > 0
              ? `
            <div style="margin-bottom: 12px; border-radius: 8px; overflow: hidden;">
              <img 
                src="${marker.photos[0]}" 
                alt="${marker.name}"
                style="width: 100%; height: 120px; object-fit: cover; display: block;"
                onerror="this.style.display='none'"
              />
            </div>
          `
              : `
            <div style="margin-bottom: 12px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 8px; height: 120px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px;">
                ${
                  marker.category === "place"
                    ? "🏛️"
                    : marker.category === "restaurant"
                    ? "🍽️"
                    : "🏨"
                }
              </span>
            </div>
          `
          }

          ${
            marker.description
              ? `
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
              ${
                marker.description.length > 150
                  ? marker.description.substring(0, 150) + "..."
                  : marker.description
              }
            </p>
          `
              : ""
          }

          <div style="font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
            ${
              marker.budget
                ? `
              <div style="margin-bottom: 4px;">
                <span style="font-weight: 600;">Budget:</span>
                <span style="text-transform: capitalize; padding: 2px 8px; border-radius: 4px; margin-left: 4px; background: ${
                  marker.budget === "low"
                    ? "#dcfce7; color: #166534"
                    : marker.budget === "high"
                    ? "#f3e8ff; color: #7e22ce"
                    : "#dbeafe; color: #1e40af"
                }">
                  ${marker.budget}
                </span>
              </div>
            `
                : ""
            }
            ${
              marker.stars
                ? `
              <div style="margin-bottom: 4px;">
                <span style="font-weight: 600;">Rating:</span>
                <span style="margin-left: 4px;">
                  ${"⭐".repeat(Math.min(5, parseInt(marker.stars) || 3))}
                </span>
              </div>
            `
                : ""
            }
            ${
              marker.wikipediaUrl
                ? `
              <a 
                href="${marker.wikipediaUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                style="color: #2563eb; text-decoration: none; font-weight: 600; display: block; margin-top: 8px;"
              >
                📖 Learn more →
              </a>
            `
                : ""
            }

            <div style="font-size: 11px; color: #9ca3af; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              📍 ${marker.location.lat.toFixed(
                4
              )}, ${marker.location.lon.toFixed(4)}
            </div>
          </div>
        </div>
      `;

      // Create button container
      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText =
        "display: flex; flex-direction: column; gap: 8px; margin-top: 12px;";

      // Show More button (always show)
      const showMoreButton = document.createElement("button");
      showMoreButton.innerHTML = "📄 Show More Details";
      showMoreButton.style.cssText = `
        width: 100%;
        padding: 8px 16px;
        background: linear-gradient(135deg, #8B5CF6, #7C3AED);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
        transition: all 0.2s;
      `;

      showMoreButton.onmouseover = () => {
        showMoreButton.style.transform = "scale(1.02)";
        showMoreButton.style.boxShadow = "0 4px 8px rgba(139, 92, 246, 0.4)";
      };

      showMoreButton.onmouseout = () => {
        showMoreButton.style.transform = "scale(1)";
        showMoreButton.style.boxShadow = "0 2px 4px rgba(139, 92, 246, 0.3)";
      };

      showMoreButton.onclick = (e) => {
        e.stopPropagation();
        showMoreDetails(marker);
      };

      buttonContainer.appendChild(showMoreButton);

      // Select Pin button
      const selectButton = document.createElement("button");
      selectButton.innerHTML = isSelected
        ? "✓ Selected"
        : "📌 Select This Place";
      selectButton.style.cssText = `
        width: 100%;
        padding: 8px 16px;
        background: ${
          isSelected
            ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
            : "linear-gradient(135deg, #10b981, #059669)"
        };
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 0 2px 4px ${
          isSelected ? "rgba(251, 191, 36, 0.3)" : "rgba(16, 185, 129, 0.3)"
        };
        transition: all 0.2s;
      `;

      selectButton.onmouseover = () => {
        selectButton.style.transform = "scale(1.02)";
        selectButton.style.boxShadow = `0 4px 8px ${
          isSelected ? "rgba(251, 191, 36, 0.4)" : "rgba(16, 185, 129, 0.4)"
        }`;
      };

      selectButton.onmouseout = () => {
        selectButton.style.transform = "scale(1)";
        selectButton.style.boxShadow = `0 2px 4px ${
          isSelected ? "rgba(251, 191, 36, 0.3)" : "rgba(16, 185, 129, 0.3)"
        }`;
      };

      selectButton.onclick = (e) => {
        e.stopPropagation();
        togglePlaceSelection(marker);
        leafletMarker.closePopup();
      };

      buttonContainer.appendChild(selectButton);

      // Route button
      const routeButton = document.createElement("button");
      routeButton.innerHTML = "🚗 Show Route Here";
      routeButton.style.cssText = `
        width: 100%;
        padding: 8px 16px;
        background: linear-gradient(135deg, #3B82F6, #2563EB);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        transition: all 0.2s;
      `;

      routeButton.onmouseover = () => {
        routeButton.style.transform = "scale(1.02)";
        routeButton.style.boxShadow = "0 4px 8px rgba(59, 130, 246, 0.4)";
      };

      routeButton.onmouseout = () => {
        routeButton.style.transform = "scale(1)";
        routeButton.style.boxShadow = "0 2px 4px rgba(59, 130, 246, 0.3)";
      };

      routeButton.onclick = (e) => {
        e.stopPropagation();
        showRoute(marker);
        leafletMarker.closePopup();
      };

      buttonContainer.appendChild(routeButton);

      // Append button container to popup
      popupContent.appendChild(buttonContainer);

      leafletMarker.bindPopup(popupContent, {
        maxWidth: 320,
        minWidth: 280,
        maxHeight: 500,
        className: "custom-popup",
      });

      leafletMarker.addTo(markersLayerRef.current);
      markerInstancesRef.current[
        `${marker.location.lat}-${marker.location.lon}`
      ] = leafletMarker;
    });

    if (markers.length > 0 && mapInstanceRef.current && !userLocation) {
      const bounds = L.latLngBounds(
        markers.map((m) => [m.location.lat, m.location.lon])
      );
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      });
    }
  }, [markers, userLocation, selectedPlaces]);

  return (
    <div className="w-full">
      {/* Map Section - Fixed Height */}
      <div className="w-full h-[600px] relative">
        <div ref={mapRef} className="w-full h-full rounded-2xl z-0" />

        {/* Control Panel */}
        <div className="absolute top-4 right-4 z-[1] space-y-2">
          {!userLocation ? (
            <button
              onClick={getUserLocation}
              disabled={loadingLocation}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-all"
            >
              {loadingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  <span>Getting Location...</span>
                </>
              ) : (
                <>
                  <span>📍</span>
                  <span>Enable My Location</span>
                </>
              )}
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 font-semibold">
                  ✓ Location Enabled
                </span>
              </div>
              <button
                onClick={() => {
                  setUserLocation(null);
                  if (userMarkerRef.current) {
                    userMarkerRef.current.remove();
                    userMarkerRef.current = null;
                  }
                  clearRoute();
                }}
                className="text-xs text-red-600 hover:text-red-700 mt-1 underline"
              >
                Disable
              </button>
            </div>
          )}

          {loadingRoute && (
            <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-700">
                Calculating route...
              </span>
            </div>
          )}
        </div>

        {/* Route Info Panel */}
        {routeInfo && selectedDestination && (
          <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-xl p-4 max-w-xs">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-sm">
                Route to {selectedDestination.name}
              </h3>
              <button
                onClick={clearRoute}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📏</span>
                <span className="text-gray-700">
                  <strong>Distance:</strong> {routeInfo.distance} km
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">⏱️</span>
                <span className="text-gray-700">
                  <strong>Duration:</strong> ~{routeInfo.duration} mins
                </span>
              </div>
            </div>

            <button
              onClick={clearRoute}
              className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all"
            >
              Clear Route
            </button>
          </div>
        )}

        <style>{`
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            padding: 0;
          }
          .leaflet-popup-content {
            margin: 16px;
            max-height: 450px;
            overflow-y: auto;
          }
          .leaflet-popup-close-button {
            font-size: 24px;
            padding: 8px 12px;
          }
          .custom-marker {
            background: transparent;
            border: none;
          }
          .user-marker {
            background: transparent;
            border: none;
          }
        `}</style>
      </div>

      {/* Selected Places Section - Extends Below Map */}
      {selectedPlaces.length > 0 && (
        <div className="w-full mt-6 bg-white rounded-2xl shadow-lg p-6 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              📌 Selected Places
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {selectedPlaces.length}{" "}
                {selectedPlaces.length === 1 ? "place" : "places"}
              </span>
            </h2>
            <button
              onClick={() => setSelectedPlaces([])}
              className="text-sm text-red-600 hover:text-red-700 hover:underline font-semibold transition-all"
            >
              Clear All
            </button>
          </div>

          {/* Compact List View */}
          <div className="space-y-3 mb-6">
            {selectedPlaces.map((place, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Icon */}
                  <div className="text-2xl">
                    {place.category === "place"
                      ? "🏛️"
                      : place.category === "restaurant"
                      ? "🍽️"
                      : "🏨"}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base">
                      {place.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Type: {getPlaceType(place.category)}
                    </p>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removePlace(place)}
                  className="ml-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold transition-all shadow-md hover:shadow-lg"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {/* Save Trip Button */}
          <button
            onClick={saveTrip}
            disabled={savingTrip}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {savingTrip ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Trip...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">💾</span>
                <span>Save This Trip</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
