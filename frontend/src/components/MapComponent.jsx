import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

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
const createCustomIcon = (category) => {
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
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
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

export default function MapComponent({ center, markers = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routingControlRef = useRef(null);
  const routeLayerRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

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
          alert(
            "Could not get your location. Please enable location services."
          );
        }
      );
    } else {
      setLoadingLocation(false);
      alert("Geolocation is not supported by your browser");
    }
  };

  // Show route from user location to destination
  const showRoute = async (destination) => {
    if (!userLocation) {
      alert("Please enable your location first!");
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
        alert("Could not find a route to this location.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      alert("Failed to calculate route. Please try again.");
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

  // Update markers when they change
  useEffect(() => {
    if (!markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Re-add user marker if it exists
    if (userMarkerRef.current) {
      userMarkerRef.current.addTo(markersLayerRef.current);
    }

    markers.forEach((marker) => {
      const leafletMarker = L.marker(
        [marker.location.lat, marker.location.lon],
        {
          icon: createCustomIcon(marker.category),
        }
      );

      const popupContent = document.createElement("div");
      popupContent.style.maxWidth = "280px";
      popupContent.style.fontFamily = "system-ui, -apple-system, sans-serif";

      popupContent.innerHTML = `
        <div>
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
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
              ${marker.description}
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

      // Add route button
      const routeButton = document.createElement("button");
      routeButton.innerHTML = "🚗 Show Route Here";
      routeButton.style.cssText = `
        width: 100%;
        margin-top: 12px;
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
        console.log("Route button clicked for:", marker.name);
        showRoute(marker);
        leafletMarker.closePopup();
      };

      // Find the last div in the innerHTML and append button to it
      const lastDiv = popupContent.querySelector("div > div:last-child");
      if (lastDiv) {
        lastDiv.appendChild(routeButton);
      } else {
        popupContent.appendChild(routeButton);
      }

      leafletMarker.bindPopup(popupContent, {
        maxWidth: 300,
        minWidth: 250,
        className: "custom-popup",
      });

      leafletMarker.addTo(markersLayerRef.current);
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
  }, [markers, userLocation]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-2xl" />

      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
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
            <span className="text-sm text-gray-700">Calculating route...</span>
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
  );
}
