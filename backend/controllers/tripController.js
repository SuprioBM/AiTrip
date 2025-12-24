import Trip from "../models/Trip.js";
import {PartnerUp} from "../models/Partner.js";
import Localhost from "../models/Host.js";

/* =========================
   Save / Update Trip
========================= */
export const saveTrip = async (req, res) => {
  try {
    const { 
      locationName, 
      placeId, 
      selectedPins,
      destination,
      startDate,
      endDate,
      numberOfDays,
      budget,
      localhost,
      localhostName 
    } = req.body;
    
    // Get user ID from authenticated request
    const userId = req.user._id;

    if (!locationName || !placeId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if trip already exists for this user + placeId
    let trip = await Trip.findOne({ user: userId, placeId });

    if (trip) {
      // Update existing trip
      trip.selectedPins = selectedPins || trip.selectedPins;
      trip.locationName = locationName;
      trip.destination = destination || trip.destination;
      trip.startDate = startDate || trip.startDate;
      trip.endDate = endDate || trip.endDate;
      trip.numberOfDays = numberOfDays || trip.numberOfDays;
      trip.budget = budget || trip.budget;
      trip.localhost = localhost || trip.localhost;
      trip.localhostName = localhostName || trip.localhostName;
      await trip.save();
    } else {
      // Create new trip
      trip = await Trip.create({
        user: userId,
        locationName,
        placeId,
        selectedPins: selectedPins || [],
        destination,
        startDate,
        endDate,
        numberOfDays,
        budget,
        localhost,
        localhostName,
      });
    }

    return res.status(200).json({ message: "Trip saved successfully", trip });
  } catch (error) {
    console.error("Save Trip Error:", error);
    return res.status(500).json({ message: "Failed to save trip", error: error.message });
  }
};

/* =========================
   Get All Trips of User
========================= */
export const getUserTrips = async (req, res) => {
  try {
    const userId = req.user._id;

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
    const userId = req.user._id;
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
    const userId = req.user._id;
    const { placeId } = req.params;

    const deleted = await Trip.findOneAndDelete({ user: userId, placeId });
    if (!deleted) return res.status(404).json({ message: "Trip not found" });

    return res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Delete Trip Error:", error);
    return res.status(500).json({ message: "Failed to delete trip" });
  }
};

/* =========================
   Update Trip Localhost
========================= */
export const updateTripLocalhost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tripId } = req.params;
    const { localhostId, localhostName } = req.body;

    // Find trip by ID and verify it belongs to the user
    const trip = await Trip.findOne({ _id: tripId, user: userId });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Verify localhost exists
    if (localhostId) {
      const localhost = await Localhost.findById(localhostId);
      if (!localhost) return res.status(404).json({ message: "Localhost not found" });
    }

    // Update trip with localhost info
    trip.localhost = localhostId || null;
    trip.localhostName = localhostName || null;
    await trip.save();

    return res.status(200).json({ 
      message: "Localhost assigned successfully", 
      trip 
    });
  } catch (error) {
    console.error("Update Trip Localhost Error:", error);
    return res.status(500).json({ message: "Failed to update localhost" });
  }
};
