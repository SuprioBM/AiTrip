// routes/aiRoutes.js
import express from "express";
import { geocodeLocation, getNearbyPlaces } from "../middleware/otmPlaces.js";
import {
  structureRestaurantDataWithAI,
  structurePlacesDataWithAI,
  structureHotelsDataWithAI,
} from "../middleware/aiTrip.js";

const router = express.Router();

/**
 * POST /api/ai/trip-suggestions
 * body: {
 *   location: string,
 *   budget: "low"|"medium"|"high",
 *   include: ["places", "restaurants", "hotels"] // optional
 * }
 */
router.post("/trip-suggestions", async (req, res) => {
  const {
    location,
    budget = "medium",
    include = ["places", "restaurants", "hotels"],
  } = req.body || {};

  if (!location || typeof location !== "string") {
    return res.status(400).json({
      success: false,
      message: "Location is required",
    });
  }

  try {
    console.log(`\n🌍 Trip Request: ${location} (${budget})`);

    // Step 1: Geocode location
    const coords = await geocodeLocation(location);

    if (!coords) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    console.log(`📍 Coordinates: ${coords.lat}, ${coords.lng}`);

    // Step 2: Fetch all data from OSM
    const nearbyData = await getNearbyPlaces(coords, budget);

    console.log("📊 Raw data received:", {
      places: nearbyData.places?.length || 0,
      restaurants: nearbyData.restaurants?.length || 0,
      hotels: nearbyData.hotels?.length || 0,
    });

    // Step 3: Process each category with AI
    const results = {
      success: true,
      location,
      center: coords,
    };

    // Process restaurants
    if (include.includes("restaurants") && nearbyData.restaurants?.length > 0) {
      console.log(
        `🍽️ Processing ${nearbyData.restaurants.length} restaurants...`
      );
      const restaurantData = await structureRestaurantDataWithAI({
        location,
        budget,
        restaurants: nearbyData.restaurants, // Pass the array directly
      });
      results.restaurants = restaurantData.restaurants;
    } else {
      results.restaurants = [];
    }

    // Process places/attractions
    if (include.includes("places") && nearbyData.places?.length > 0) {
      console.log(`🏛️ Processing ${nearbyData.places.length} places...`);
      const placesData = await structurePlacesDataWithAI({
        location,
        budget,
        places: nearbyData.places, // Pass the array directly
      });
      results.places = placesData.places;
    } else {
      results.places = [];
    }

    // Process hotels
    if (include.includes("hotels") && nearbyData.hotels?.length > 0) {
      console.log(`🏨 Processing ${nearbyData.hotels.length} hotels...`);
      const hotelsData = await structureHotelsDataWithAI({
        hotels: nearbyData.hotels, // Pass the array directly
      });
      results.hotels = hotelsData.hotels;
    } else {
      results.hotels = [];
    }

    console.log("\n✅ Trip suggestions ready:", {
      places: results.places?.length || 0,
      restaurants: results.restaurants?.length || 0,
      hotels: results.hotels?.length || 0,
    });

    return res.json(results);
  } catch (err) {
    console.error("❌ Route error:", err.message);
    console.error(err.stack);

    return res.status(500).json({
      success: false,
      message: "Failed to generate trip suggestions",
      error: err.message,
    });
  }
});

/**
 * POST /api/ai/restaurants
 * Separate endpoint for just restaurants (backward compatibility)
 */
router.post("/restaurants", async (req, res) => {
  const { location, budget = "medium" } = req.body || {};

  if (!location) {
    return res.status(400).json({
      success: false,
      message: "Location is required",
    });
  }

  try {
    const coords = await geocodeLocation(location);
    if (!coords) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    const nearbyData = await getNearbyPlaces(coords, budget);

    const structured = await structureRestaurantDataWithAI({
      location,
      budget,
      restaurants: nearbyData.restaurants || [], // Pass array directly
    });

    return res.json({
      success: true,
      ...structured,
      center: coords,
    });
  } catch (err) {
    console.error("❌ Restaurant route error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate restaurant suggestions",
    });
  }
});

export default router;
