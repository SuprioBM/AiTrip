import Trip from "../models/Trip.js";
import {PartnerUp} from "../models/Partner.js";
import Localhost from "../models/Host.js";

/* =========================
   Save / Update Trip
========================= */
export const saveTrip = async (req, res) => {
  try {
    const { user,locationName, placeId, selectedPins } = req.body;
    

    if (!locationName || !placeId || !selectedPins || !selectedPins.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if trip already exists for this user + placeId
    let trip = await Trip.findOne({ user: user.id, placeId });

    if (trip) {
      // Update existing trip
      trip.selectedPins = selectedPins;
      trip.locationName = locationName;
      await trip.save();
    } else {
      // Create new trip
      trip = await Trip.create({
        user: user.id,
        locationName,
        placeId,
        selectedPins,
      });
    }

    return res.status(200).json({ message: "Trip saved successfully", trip });
  } catch (error) {
    console.error("Save Trip Error:", error);
    return res.status(500).json({ message: "Failed to save trip" });
  }
};

/* =========================
   Get All Trips of User
========================= */
export const getUserTrips = async (req, res) => {
  try {
    const userId = req.user.id;

    const trips = await Trip.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({ count: trips.length, trips });
  } catch (error) {
    console.error("Get User Trips Error:", error);
    return res.status(500).json({ message: "Failed to fetch trips" });
  }
};

/* =========================
   Get Trip by PlaceId (with localhost & partner-up)
========================= */
export const getTripByPlace = async (req, res) => {
  try {
    const userId = req.user.id;
    const { placeId } = req.params;

    const trip = await Trip.findOne({ user: userId, placeId });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Get related localhosts
    const locationCode = placeId.slice(0, 2).toLowerCase(); // e.g., "dh" from "dh01"
    const localhosts = await Localhost.find({ locationCode });

    // Get partner-ups for this location
    const partnerUps = await PartnerUp.find({ placeId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      trip,
      localhosts,
      partnerUps,
    });
  } catch (error) {
    console.error("Get Trip By Place Error:", error);
    return res.status(500).json({ message: "Failed to fetch trip" });
  }
};

/* =========================
   Delete Trip
========================= */
export const deleteTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { placeId } = req.params;

    const deleted = await Trip.findOneAndDelete({ user: userId, placeId });
    if (!deleted) return res.status(404).json({ message: "Trip not found" });

    return res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Delete Trip Error:", error);
    return res.status(500).json({ message: "Failed to delete trip" });
  }
};
