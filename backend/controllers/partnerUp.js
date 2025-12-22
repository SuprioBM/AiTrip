import { PartnerUp, PartnerUpMember } from "../models/Partner.js";
import { Notification } from "../models/Notification.js";

/* =========================
   Create Partner-Up Group
========================= */
export const createPartnerUp = async (req, res) => {
  try {
    const {
      placeId,
      placeName,
      maxMembers,
      numberOfPeople,
      budgetRange,
      numberOfDays,
      startDate,
      endDate,
      location,
    } = req.body;

    const userId = req.user.id;

    if (!placeId || !placeName || !(maxMembers || numberOfPeople)) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // ✅ Validate location
    if (!location?.lat || !location?.lon) {
      return res.status(400).json({
        message: "Location (lat, lon) is required",
      });
    }

    const resolvedMax = maxMembers || numberOfPeople;

    // ✅ Convert lat/lon → GeoJSON
    const geoLocation = {
      type: "Point",
      coordinates: [location.lon, location.lat], // [lng, lat]
    };

    // 1️⃣ Create PartnerUp
    const partnerUp = await PartnerUp.create({
      placeId,
      placeName,
      maxMembers: resolvedMax,
      numberOfPeople: numberOfPeople || resolvedMax,
      budgetRange: budgetRange || {},
      numberOfDays,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      location: geoLocation, // ✅ FIX
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Partner-up created",
      data: partnerUp,
    });
  } catch (error) {
    console.error("Create PartnerUp Error:", error);
    return res.status(500).json({
      message: "Failed to create partner-up",
    });
  }
};


/* =========================
   Request to Join Partner-Up
========================= */
export const requestToJoinPartnerUp = async (req, res) => {
  try {
    const { partnerUpId } = req.params;
    const userId = req.user.id;
    const { placeName, location } = req.body || {};

    const partnerUp = await PartnerUp.findById(partnerUpId);
    if (!partnerUp || partnerUp.status !== "open") {
      return res.status(400).json({ message: "Partner-up not available" });
    }

    const member = await PartnerUpMember.create({
      partnerUp: partnerUpId,
      user: userId,
      status: "pending",
      placeName: placeName || partnerUp.placeName,
      location: location || partnerUp.location,
    });

    // Create a notification for the creator (include member id so creator can act)
    try {
      await Notification.create({
        recipient: partnerUp.createdBy,
        actor: userId,
        type: "partner_request",
        data: {
          partnerUp: partnerUpId,
          memberId: member._id,
          placeName: partnerUp.placeName,
        },
      });
    } catch (nerr) {
      console.error("Failed to create notification:", nerr);
    }

    return res.status(200).json({
      success: true,
      message: "Join request sent",
      memberId: member._id,
    });
  } catch (error) {
    // duplicate join handled by unique index
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already requested or joined" });
    }

    console.error("Join PartnerUp Error:", error);
    return res.status(500).json({ message: "Failed to join partner-up" });
  }
};

/* =========================
   Search Partner-Ups (by placeId or coordinates)
========================= */
export const searchPartnerUps = async (req, res) => {
  try {
    const { placeId, location, startDate, endDate } = req.body;

    if (!placeId && !(location?.lat && location?.lon)) {
      return res.status(400).json({
        message: "placeId or location (lat, lon) required",
      });
    }

    const query = {
      status: { $ne: "closed" },
    };

    // Match by placeId if provided
    if (placeId) {
      query.placeId = placeId;
    }

    // 📍 Geo proximity search (fuzzy lat-lon)
    if (location?.lat && location?.lon) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [location.lon, location.lat],
          },
          $maxDistance: 5000, // meters (5km radius)
        },
      };
    }

    // 📅 Date overlap logic
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);

      query.$or = [
        { startDate: { $exists: false } },
        { endDate: { $exists: false } },
        {
          $and: [{ startDate: { $lte: e } }, { endDate: { $gte: s } }],
        },
      ];
    }

    const partnerUps = await PartnerUp.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name profilePic");

    return res.status(200).json({
      success: true,
      count: partnerUps.length,
      data: partnerUps,
    });
  } catch (err) {
    console.error("Search PartnerUps Error:", err);
    return res.status(500).json({
      message: "Failed to search partner-ups",
    });
  }
};


/* =========================
   Accept / Reject Join Request
========================= */
export const respondToJoinRequest = async (req, res) => {
  try {
    const { partnerUpId, memberId } = req.params;
    const { action, user } = req.body; // "accept" or "reject"
    console.log(partnerUpId);
    console.log(memberId);
    console.log(action);
    const userId = user.id;
    
    
    
    

    const partnerUp = await PartnerUp.findById(partnerUpId);
    if (!partnerUp) {
      return res.status(404).json({ message: "Partner-up not found" });
    }

    // Ensure only creator can respond
    const creator = await PartnerUpMember.findOne({
      partnerUp: partnerUpId,
    });

    if (!creator) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const member = await PartnerUpMember.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.status = action === "accept" ? "accepted" : "rejected";
    await member.save();

    // Notify the requester about the decision
    try {
      await Notification.create({
        recipient: member.user,
        actor: userId,
        type: "partner_response",
        data: {
          partnerUp: partnerUpId,
          memberId: member._id,
          action,
          placeName: partnerUp.placeName,
        },
        read: false,
      });
    } catch (nerr) {
      console.error("Failed to create response notification:", nerr);
    }

    // Recalculate accepted members
    const acceptedCount = await PartnerUpMember.countDocuments({
      partnerUp: partnerUpId,
      status: "accepted",
    });

    if (acceptedCount >= partnerUp.maxMembers) {
      partnerUp.status = "full";
      await partnerUp.save();
    }

    return res.status(200).json({
      message: `Request ${action}ed`,
    });
  } catch (error) {
    console.error("Respond PartnerUp Error:", error);
    return res.status(500).json({ message: "Failed to respond" });
  }
};

// GET all members for a partnerUp with their status
export const getPartnerUpMembers = async (req, res) => {
  try {
    const { partnerUpId } = req.params;

    const members = await PartnerUpMember.find({
      partnerUp: partnerUpId,
    }).populate("user", "name email profilePic"); // optional

    res.json({ success: true, data: members });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch members" });
  }
};

