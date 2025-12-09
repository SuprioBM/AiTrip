// services/otmPlaces.js
// Using Overpass API (OpenStreetMap) + Wikipedia/Wikimedia for photos & details
import axios from "axios";

// --------------------------
// CONFIG
// --------------------------
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";

let currentServerIndex = 0;

// ================================================================
// WIKIPEDIA/WIKIMEDIA FUNCTIONS
// ================================================================

/**
 * Extract Wikipedia article name from various tag formats
 */
const extractWikipediaTitle = (tags) => {
  if (!tags) return null;

  // Try different Wikipedia tag formats
  const wpTag = tags.wikipedia || tags["wikipedia:en"] || tags.wikidata;
  if (!wpTag) return null;

  // Handle "en:Article_Name" format
  if (wpTag.includes(":")) {
    return wpTag.split(":")[1];
  }

  return wpTag;
};

/**
 * Fetch Wikipedia summary and main image
 */
const fetchWikipediaData = async (title) => {
  if (!title) return null;

  try {
    const params = {
      action: "query",
      format: "json",
      titles: title,
      prop: "extracts|pageimages|info",
      exintro: true,
      explaintext: true,
      exsentences: 3,
      pithumbsize: 500,
      inprop: "url",
      origin: "*",
    };

    const response = await axios.get(WIKIPEDIA_API, {
      params,
      headers: {
        "User-Agent": "AiTrip/1.0 (mugdharj632@gmail.com)",
      },
      timeout: 8000,
    });

    const pages = response.data.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0];
    if (page.missing) return null;

    return {
      description: page.extract || null,
      image: page.thumbnail?.source || null,
      imageWidth: page.thumbnail?.width || null,
      imageHeight: page.thumbnail?.height || null,
      wikipediaUrl:
        page.fullurl ||
        `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      title: page.title,
    };
  } catch (err) {
    console.error(`❌ Wikipedia fetch failed for "${title}":`, err.message);
    return null;
  }
};

/**
 * Fetch images from Wikimedia Commons by searching
 */
const fetchWikimediaImages = async (placeName, location) => {
  try {
    const searchQuery = `${placeName}`;
    const params = {
      action: "query",
      format: "json",
      generator: "search",
      gsrsearch: searchQuery,
      gsrnamespace: 6, // File namespace
      gsrlimit: 3,
      prop: "imageinfo",
      iiprop: "url|size",
      iiurlwidth: 500,
      origin: "*",
    };

    const response = await axios.get(
      "https://commons.wikimedia.org/w/api.php",
      {
        params,
        headers: {
          "User-Agent": "AiTrip/1.0 (mugdharj632@gmail.com)",
        },
        timeout: 8000,
      }
    );

    const pages = response.data.query?.pages;
    if (!pages) return [];

    const images = Object.values(pages)
      .filter((page) => page.imageinfo && page.imageinfo[0])
      .map((page) => ({
        url: page.imageinfo[0].thumburl || page.imageinfo[0].url,
        width: page.imageinfo[0].thumbwidth || page.imageinfo[0].width,
        height: page.imageinfo[0].thumbheight || page.imageinfo[0].height,
        source: "wikimedia",
      }))
      .slice(0, 3); // Max 3 images

    return images;
  } catch (err) {
    // Silently fail for Wikimedia (403 is common)
    if (err.response?.status !== 403) {
      console.error(
        `❌ Wikimedia search failed for "${placeName}":`,
        err.message
      );
    }
    return [];
  }
};

/**
 * Enrich place data with Wikipedia info
 */
const enrichWithWikipedia = async (place) => {
  try {
    const wikipediaTitle = extractWikipediaTitle(place.tags);

    if (wikipediaTitle) {
      console.log(`📖 Fetching Wikipedia data for: ${place.name}`);
      const wikiData = await fetchWikipediaData(wikipediaTitle);

      if (wikiData) {
        place.description = wikiData.description;
        place.image = wikiData.image;
        place.imageWidth = wikiData.imageWidth;
        place.imageHeight = wikiData.imageHeight;
        place.wikipediaUrl = wikiData.wikipediaUrl;
        place.hasWikipedia = true;
        delete place.tags; // Clean up
        return place;
      }
    }

    // Skip Wikimedia Commons search due to common 403 errors
    // Only use Wikipedia data if available in OSM tags
    delete place.tags; // Clean up
    return place;
  } catch (err) {
    console.error(`❌ Error enriching ${place.name}:`, err.message);
    delete place.tags; // Clean up even on error
    return place;
  }
};

// ================================================================
// ORIGINAL FUNCTIONS (Updated)
// ================================================================

export const geocodeLocation = async (locationText) => {
  try {
    const res = await axios.get(NOMINATIM_URL, {
      params: {
        q: locationText,
        format: "json",
        limit: 5,
        email: "mugdharj632@gmail.com",
      },
      headers: {
        "User-Agent": "AiTrip/1.0 (mugdharj632@gmail.com)",
      },
      timeout: 8000,
    });

    console.log("✓ Found", res.data.length, "location results");

    if (!Array.isArray(res.data) || res.data.length === 0) return null;

    const cityResult = res.data.find(
      (r) =>
        r.type === "city" ||
        r.type === "town" ||
        r.addresstype === "city" ||
        r.addresstype === "town" ||
        r.class === "place"
    );

    const result = cityResult || res.data[0];
    console.log(
      "✓ Using:",
      result.display_name,
      `(${result.type || result.addresstype})`
    );

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
  } catch (err) {
    console.error("❌ geocodeLocation error:", err.message);
    return null;
  }
};

const fetchOverpass = async (query, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const server = OVERPASS_SERVERS[currentServerIndex];
      console.log(
        `🔄 Trying server ${currentServerIndex + 1}/${
          OVERPASS_SERVERS.length
        }...`
      );

      const res = await axios.post(server, query, {
        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "AiTrip/1.0 (mugdharj632@gmail.com)",
        },
        timeout: 20000,
      });

      return res.data.elements || [];
    } catch (err) {
      console.error(
        `❌ Server ${currentServerIndex + 1} failed:`,
        err.response?.status || err.message
      );
      currentServerIndex = (currentServerIndex + 1) % OVERPASS_SERVERS.length;

      if (i === retries) {
        console.error("❌ All servers failed or timed out");
        return [];
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return [];
};

const fetchOverpassPlaces = async (coords, radius = 5000) => {
  try {
    // Enhanced query to include Wikipedia/Wikidata tags
    const query = `
      [out:json][timeout:20];
      (
        node["tourism"](around:${radius},${coords.lat},${coords.lng});
        way["tourism"](around:${radius},${coords.lat},${coords.lng});
        node["historic"](around:${radius},${coords.lat},${coords.lng});
        way["historic"](around:${radius},${coords.lat},${coords.lng});
        node["leisure"](around:${radius},${coords.lat},${coords.lng});
        way["leisure"](around:${radius},${coords.lat},${coords.lng});
        node["amenity"~"place_of_worship|community_centre|library"](around:${radius},${coords.lat},${coords.lng});
      );
      out center body 100;
    `;

    console.log(`📍 Fetching tourist places (radius: ${radius}m)...`);
    const elements = await fetchOverpass(query);
    console.log(`✓ Found ${elements.length} tourist places (raw)`);

    const places = elements
      .filter(
        (el) =>
          el.tags && (el.tags.name || el.tags["name:en"] || el.tags["name:bn"])
      )
      .map((el) => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        return {
          xid: `osm_${el.type}_${el.id}`,
          name: el.tags.name || el.tags["name:en"] || el.tags["name:bn"],
          kinds:
            el.tags.tourism ||
            el.tags.historic ||
            el.tags.leisure ||
            el.tags.amenity ||
            "place",
          point: { lon, lat },
          dist: calculateDistance(coords, { lat, lng: lon }),
          tags: el.tags, // Keep tags for Wikipedia enrichment
        };
      })
      .filter((p) => p.point.lat && p.point.lon);

    console.log(`✓ Processed ${places.length} named places`);

    // Enrich top places with Wikipedia data (limit to avoid rate limiting)
    const topPlaces = places.slice(0, 10); // Only enrich top 10
    const enrichedPlaces = [];

    for (const place of topPlaces) {
      const enriched = await enrichWithWikipedia(place);
      enrichedPlaces.push(enriched);
      await new Promise((resolve) => setTimeout(resolve, 200)); // Rate limiting
    }

    // Add remaining places without enrichment
    const remainingPlaces = places.slice(10).map((p) => {
      delete p.tags; // Clean up tags
      return p;
    });

    return [...enrichedPlaces, ...remainingPlaces];
  } catch (err) {
    console.error("❌ fetchOverpassPlaces error:", err.message);
    return [];
  }
};

const fetchOverpassRestaurants = async (coords, radius = 5000) => {
  try {
    const query = `
      [out:json][timeout:20];
      (
        node["amenity"~"restaurant|cafe|fast_food|food_court|bar"](around:${radius},${coords.lat},${coords.lng});
        way["amenity"~"restaurant|cafe|fast_food"](around:${radius},${coords.lat},${coords.lng});
        node["shop"~"bakery|confectionery"](around:${radius},${coords.lat},${coords.lng});
      );
      out center body 100;
    `;

    console.log(`🍽️ Fetching restaurants (radius: ${radius}m)...`);
    const elements = await fetchOverpass(query);
    console.log(`✓ Found ${elements.length} restaurants (raw)`);

    const restaurants = elements
      .filter(
        (el) =>
          el.tags && (el.tags.name || el.tags["name:en"] || el.tags["name:bn"])
      )
      .map((el) => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        return {
          xid: `osm_${el.type}_${el.id}`,
          name: el.tags.name || el.tags["name:en"] || el.tags["name:bn"],
          kinds: el.tags.amenity || el.tags.shop || "restaurant",
          point: { lon, lat },
          dist: calculateDistance(coords, { lat, lng: lon }),
          cuisine: el.tags.cuisine,
          tags: el.tags,
        };
      })
      .filter((r) => r.point.lat && r.point.lon);

    console.log(`✓ Processed ${restaurants.length} named restaurants`);
    return restaurants;
  } catch (err) {
    console.error("❌ fetchOverpassRestaurants error:", err.message);
    return [];
  }
};

const fetchOverpassHotels = async (coords, radius = 5000) => {
  try {
    const query = `
      [out:json][timeout:20];
      (
        node["tourism"~"hotel|hostel|guest_house|motel|apartment"](around:${radius},${coords.lat},${coords.lng});
        way["tourism"~"hotel|hostel|guest_house"](around:${radius},${coords.lat},${coords.lng});
        node["building"="hotel"](around:${radius},${coords.lat},${coords.lng});
      );
      out center body 100;
    `;

    console.log(`🏨 Fetching hotels (radius: ${radius}m)...`);
    const elements = await fetchOverpass(query);
    console.log(`✓ Found ${elements.length} hotels (raw)`);

    const hotels = elements
      .filter(
        (el) =>
          el.tags && (el.tags.name || el.tags["name:en"] || el.tags["name:bn"])
      )
      .map((el) => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        return {
          xid: `osm_${el.type}_${el.id}`,
          name: el.tags.name || el.tags["name:en"] || el.tags["name:bn"],
          kinds: el.tags.tourism || "hotel",
          point: { lon, lat },
          dist: calculateDistance(coords, { lat, lng: lon }),
          stars: el.tags.stars,
          tags: el.tags,
        };
      })
      .filter((h) => h.point.lat && h.point.lon);

    console.log(`✓ Processed ${hotels.length} named hotels`);
    return hotels;
  } catch (err) {
    console.error("❌ fetchOverpassHotels error:", err.message);
    return [];
  }
};

const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2 || !coord2.lat || !coord2.lng) return 999999;

  const R = 6371000;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const generateFallbackData = (coords) => {
  console.log("🔄 Generating fallback data for sparse area");

  return {
    places: [
      {
        xid: "fb_1",
        name: "City Center",
        kinds: "urban_environment",
        dist: 500,
      },
      { xid: "fb_2", name: "Local Market Area", kinds: "shopping", dist: 800 },
      { xid: "fb_3", name: "Cultural Quarter", kinds: "cultural", dist: 1200 },
      { xid: "fb_4", name: "Historic District", kinds: "historic", dist: 1500 },
      { xid: "fb_5", name: "Riverside Park", kinds: "natural", dist: 2000 },
    ],
    restaurants: [
      {
        xid: "fb_r1",
        name: "Local Cuisine Restaurant",
        kinds: "restaurant",
        dist: 300,
      },
      {
        xid: "fb_r2",
        name: "Traditional Eatery",
        kinds: "restaurant",
        dist: 600,
      },
      { xid: "fb_r3", name: "Street Food Area", kinds: "fast_food", dist: 900 },
      { xid: "fb_r4", name: "Tea House", kinds: "cafe", dist: 400 },
    ],
    hotels: [
      { xid: "fb_h1", name: "City Hotel", kinds: "hotel", dist: 400 },
      {
        xid: "fb_h2",
        name: "Budget Guest House",
        kinds: "guest_house",
        dist: 700,
      },
      { xid: "fb_h3", name: "Tourist Inn", kinds: "hotel", dist: 1100 },
    ],
  };
};

// ================================================================
// ENHANCED: Fetch detailed place info with Wikipedia/Wikimedia
// ================================================================
export const fetchPlaceDetails = async (xid, placeName, placeData = null) => {
  console.log(`📋 Fetching details for: ${placeName}`);

  try {
    // If we already have the place data with tags, use it
    if (placeData && placeData.tags) {
      const enriched = await enrichWithWikipedia(placeData);
      return {
        xid,
        name: placeName,
        ...enriched,
      };
    }

    // Otherwise, search Wikipedia/Wikimedia
    const wikiData = await fetchWikipediaData(placeName);
    const images = await fetchWikimediaImages(placeName);

    return {
      xid,
      name: placeName,
      description: wikiData?.description || "No description available",
      image: wikiData?.image || images[0]?.url || null,
      imageWidth: wikiData?.imageWidth || images[0]?.width || null,
      imageHeight: wikiData?.imageHeight || images[0]?.height || null,
      wikipediaUrl: wikiData?.wikipediaUrl || null,
      additionalImages: images.slice(1),
      hasData: !!(wikiData || images.length > 0),
    };
  } catch (err) {
    console.error(`❌ Error fetching details for ${placeName}:`, err.message);
    return {
      xid,
      name: placeName,
      description: "Details unavailable",
      hasData: false,
    };
  }
};

// ================================================================
// MAIN FUNCTION
// ================================================================
export const getNearbyPlaces = async (coords, budget = "medium") => {
  if (!coords) {
    console.log("❌ No coords provided");
    return { places: [], restaurants: [], hotels: [] };
  }

  let radius = 10000;
  if (budget === "low") radius = 15000;
  if (budget === "high") radius = 7000;

  console.log(
    `\n🌍 Searching near (${coords.lat}, ${coords.lng}) with ${radius}m radius\n`
  );

  try {
    const places = await fetchOverpassPlaces(coords, radius);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const restaurants = await fetchOverpassRestaurants(coords, radius);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const hotels = await fetchOverpassHotels(coords, radius);

    const totalResults = places.length + restaurants.length + hotels.length;

    console.log("\n📊 Results:", {
      places: places.length,
      restaurants: restaurants.length,
      hotels: hotels.length,
      total: totalResults,
    });

    if (totalResults === 0) {
      console.log("⚠️ No OpenStreetMap data available - using fallback");
      return generateFallbackData(coords);
    }

    return {
      places: Array.isArray(places) ? places : [],
      restaurants: Array.isArray(restaurants) ? restaurants : [],
      hotels: Array.isArray(hotels) ? hotels : [],
    };
  } catch (error) {
    console.error("❌ Error in getNearbyPlaces:", error);
    return generateFallbackData(coords);
  }
};

export default {
  geocodeLocation,
  getNearbyPlaces,
  fetchPlaceDetails,
};
