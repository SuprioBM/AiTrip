// import OpenAI from "openai";
// import dotenv from "dotenv";
// import Trip from "../models/Trip.js";

// dotenv.config();
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // Simple AI itinerary generation using OpenAI: returns itinerary items with coordinates.
// export const generateItinerary = async (req, res, next) => {
//   try {
//     const { preferences } = req.body; // budget, interests, travelMode, days

//     // Build prompt (simple example) - you should refine for production
//     const prompt = `Create a ${
//       preferences.totalDays || 3
//     }-day itinerary for a traveler interested in ${
//       preferences.interests
//     } with a ${
//       preferences.budget
//     } budget. Include places with lat/lng coordinates and short descriptions.`;

//     const response = await client.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 800,
//     });

//     const text = response.choices?.[0]?.message?.content || "";

//     // NOTE: In production parse structured JSON. Here we'll store the raw text and a placeholder parsed itinerary.
//     const parsedItinerary = [
//       {
//         day: 1,
//         title: "Sample Place A",
//         description: "Description",
//         coordinates: { lat: 40.7128, lng: -74.006 },
//       },
//       {
//         day: 2,
//         title: "Sample Place B",
//         description: "Description",
//         coordinates: { lat: 40.706, lng: -74.0086 },
//       },
//     ];

//     const trip = await Trip.create({
//       user: req.user._id,
//       title: `AI Trip - ${new Date().toISOString()}`,
//       preferences,
//       itinerary: parsedItinerary,
//       totalDays: preferences.totalDays,
//     });

//     res.json({ aiText: text, trip });
//   } catch (err) {
//     next(err);
//   }
// };
