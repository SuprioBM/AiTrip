// services/aiTrip.js
import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_KEY) {
  console.warn("Missing OPENROUTER_API_KEY in env");
}

export const structureRestaurantDataWithAI = async (input) => {
  const { location, budget, restaurants } = input;

  // CRITICAL FIX: Extract the restaurants array from the object
  const restaurantList = Array.isArray(restaurants)
    ? restaurants
    : restaurants?.restaurants || [];

  // If no restaurants, return empty immediately
  if (restaurantList.length === 0) {
    console.log("⚠️ No restaurants to process");
    return { restaurants: [] };
  }

  const prompt = `
You will receive RAW restaurant objects from OpenStreetMap.

STRICT RULES:
1. Use ONLY the provided restaurants. Do NOT invent new ones.
2. Do NOT add prices or ratings.
3. Output ONLY valid JSON with structure: {"restaurants": [...]}
4. Each restaurant MUST have:
   - name (string)
   - cuisine (string, from tags or infer from name)
   - shortDescription (1 sentence, max 100 chars)
   - photos (array, use empty array [] if none)
   - location (object with lon/lat from point field)
   - inferred_budget (string: "low", "medium", or "high")
5. Infer budget from: name keywords, cuisine type
   - "street", "fast_food", "local", "cheap" → low
   - "fine dining", "luxury", "upscale", "premium" → high
   - Otherwise → medium
6. Return maximum 15 restaurants.
7. Filter based on user budget "${budget}":
   - low → prefer low + some medium
   - medium → mix of all
   - high → prefer high + medium
8. If no photos available, use empty array: "photos": []
9. Generate shortDescription from name and cuisine if no other info.

USER INPUT:
Location: ${location}
Budget: ${budget}

RESTAURANTS DATA:
${JSON.stringify(restaurantList.slice(0, 30), null, 2)}

RESPOND WITH ONLY VALID JSON. NO EXPLANATIONS. NO MARKDOWN.
`;

  try {
    console.log(`🤖 Sending ${restaurantList.length} restaurants to AI...`);

    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000, // Increased for better responses
        temperature: 0.3, // Lower for more consistent JSON
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_KEY}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const aiText = response.data?.choices?.[0]?.message?.content;
    if (!aiText) throw new Error("No AI output");

    console.log("📝 AI Response length:", aiText.length);

    // Clean the response
    let cleaned = aiText.trim();

    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    // Extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        "❌ No JSON found in AI response:",
        aiText.substring(0, 200)
      );
      throw new Error("No JSON found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!parsed.restaurants || !Array.isArray(parsed.restaurants)) {
      console.error("❌ Invalid structure:", parsed);
      throw new Error("AI response missing 'restaurants' array");
    }

    // Validate and clean each restaurant
    const validRestaurants = parsed.restaurants
      .filter((r) => r.name && r.location)
      .map((r) => ({
        name: r.name || "Unknown",
        cuisine: r.cuisine || "General",
        shortDescription: (r.shortDescription || r.name || "").substring(
          0,
          150
        ),
        photos: Array.isArray(r.photos) ? r.photos : [],
        location: r.location || null,
        inferred_budget: ["low", "medium", "high"].includes(r.inferred_budget)
          ? r.inferred_budget
          : "medium",
      }))
      .slice(0, 15);

    console.log(`✅ Processed ${validRestaurants.length} restaurants via AI`);

    return { restaurants: validRestaurants };
  } catch (err) {
    console.error("❌ AI structuring error:", err.message);

    // FALLBACK: Manual formatting without AI
    console.log("🔄 Using fallback formatting...");

    const inferBudget = (r) => {
      const text = `${r.kinds || ""} ${r.name || ""} ${
        r.cuisine || ""
      }`.toLowerCase();
      if (/(fine|luxury|upscale|premium|high.end)/.test(text)) return "high";
      if (/(fast.food|street|cheap|budget|local|affordable)/.test(text))
        return "low";
      return "medium";
    };

    const inferCuisine = (r) => {
      if (r.cuisine) return r.cuisine;
      if (r.kinds) {
        if (r.kinds.includes("cafe")) return "Cafe";
        if (r.kinds.includes("fast_food")) return "Fast Food";
        if (r.kinds.includes("bar")) return "Bar";
      }
      return "General";
    };

    const fallbackRestaurants = restaurantList
      .filter((r) => r.name && r.point)
      .map((r) => ({
        name: r.name,
        cuisine: inferCuisine(r),
        shortDescription:
          r.description || `${r.name} - ${inferCuisine(r)} restaurant`,
        photos: r.image ? [r.image] : [],
        location: {
          lon: r.point.lon,
          lat: r.point.lat,
        },
        inferred_budget: inferBudget(r),
      }))
      .slice(0, 15);

    console.log(
      `✅ Fallback: formatted ${fallbackRestaurants.length} restaurants`
    );

    return { restaurants: fallbackRestaurants };
  }
};

// NEW: Structure places (tourist attractions)
export const structurePlacesDataWithAI = async (input) => {
  const { location, budget, places } = input;

  const placesList = Array.isArray(places) ? places : places?.places || [];

  if (placesList.length === 0) {
    return { places: [] };
  }

  // Similar structure but for places
  const prompt = `
You will receive tourist places/attractions from OpenStreetMap with Wikipedia data.

STRICT RULES:
1. Use ONLY provided places. Do NOT invent.
2. Output ONLY valid JSON: {"places": [...]}
3. Each place MUST have:
   - name (string)
   - category (string: "historic", "cultural", "nature", "entertainment", "religious", "museum")
   - shortDescription (1-2 sentences, use Wikipedia description if available)
   - photos (array, use image/additionalImages if available)
   - location (object with lon/lat)
   - wikipediaUrl (string or null)
4. Return max 15 best places
5. Prioritize places with:
   - Wikipedia data (hasWikipedia: true)
   - Photos
   - Good descriptions
6. NO MARKDOWN. ONLY JSON.

INPUT:
${JSON.stringify(placesList.slice(0, 30), null, 2)}

RESPOND WITH ONLY VALID JSON:
`;

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_KEY}`,
        },
        timeout: 30000,
      }
    );

    const aiText = response.data?.choices?.[0]?.message?.content;
    let cleaned = aiText
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch[0]);

    const validPlaces = parsed.places
      .filter((p) => p.name && p.location)
      .map((p) => ({
        name: p.name,
        category: p.category || "attraction",
        shortDescription: (p.shortDescription || "").substring(0, 200),
        photos: Array.isArray(p.photos) ? p.photos : [],
        location: p.location,
        wikipediaUrl: p.wikipediaUrl || null,
      }))
      .slice(0, 15);

    return { places: validPlaces };
  } catch (err) {
    console.error("❌ Places AI error:", err.message);

    // Fallback
    const fallbackPlaces = placesList
      .filter((p) => p.name && p.point)
      .map((p) => ({
        name: p.name,
        category: p.kinds || "attraction",
        shortDescription: p.description || p.name,
        photos: p.image ? [p.image, ...(p.additionalImages || [])] : [],
        location: { lon: p.point.lon, lat: p.point.lat },
        wikipediaUrl: p.wikipediaUrl || null,
      }))
      .slice(0, 15);

    return { places: fallbackPlaces };
  }
};

// NEW: Structure hotels
export const structureHotelsDataWithAI = async (input) => {
  const { hotels } = input;

  const hotelsList = Array.isArray(hotels) ? hotels : hotels?.hotels || [];

  if (hotelsList.length === 0) {
    return { hotels: [] };
  }

  // Fallback only (hotels usually don't need much AI processing)
  const fallbackHotels = hotelsList
    .filter((h) => h.name && h.point)
    .map((h) => ({
      name: h.name,
      type: h.kinds || "hotel",
      shortDescription:
        h.description || `${h.name} - ${h.kinds || "Accommodation"}`,
      photos: h.image ? [h.image] : [],
      location: { lon: h.point.lon, lat: h.point.lat },
      stars: h.stars || null,
    }))
    .slice(0, 15);

  return { hotels: fallbackHotels };
};
