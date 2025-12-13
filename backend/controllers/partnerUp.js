import { PartnerUp, PartnerUpMember } from "../models/Partner.js";

/* =========================
   Create Partner-Up Group
========================= */
export const createPartnerUp = async (req, res) => {
  try {
    const { placeId, placeName, maxMembers } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!placeId || !placeName || !maxMembers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Create PartnerUp group
    const partnerUp = await PartnerUp.create({
      placeId,
      placeName,
      maxMembers,
      createdBy: userId,
    });

    // 2. Add creator as accepted member
    await PartnerUpMember.create({
      partnerUp: partnerUp._id,
      user: userId,
      role: "creator",
      status: "accepted",
    });

    return res.status(201).json({
      message: "Partner-up created",
      data: partnerUp,
    });
  } catch (error) {
    console.error("Create PartnerUp Error:", error);
    return res.status(500).json({ message: "Failed to create partner-up" });
  }
};

/* =========================
   Get Partner-Ups by Place
========================= */
export const getPartnerUpsByPlace = async (req, res) => {
  try {
    const { placeId } = req.params;

    const partnerUps = await PartnerUp.find({
      placeId,
      status: { $ne: "closed" },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: partnerUps.length,
      data: partnerUps,
    });
  } catch (error) {
    console.error("Get PartnerUps Error:", error);
    return res.status(500).json({ message: "Failed to fetch partner-ups" });
  }
};

/* =========================
   Request to Join Partner-Up
========================= */
export const requestToJoinPartnerUp = async (req, res) => {
  try {
    const { partnerUpId } = req.params;
    const userId = req.user.id;

    const partnerUp = await PartnerUp.findById(partnerUpId);
    if (!partnerUp || partnerUp.status !== "open") {
      return res.status(400).json({ message: "Partner-up not available" });
    }

    await PartnerUpMember.create({
      partnerUp: partnerUpId,
      user: userId,
      status: "pending",
    });

    return res.status(200).json({
      message: "Join request sent",
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
   Accept / Reject Join Request
========================= */
export const respondToJoinRequest = async (req, res) => {
  try {
    const { partnerUpId, memberId } = req.params;
    const { action } = req.body; // "accept" or "reject"
    const userId = req.user.id;

    const partnerUp = await PartnerUp.findById(partnerUpId);
    if (!partnerUp) {
      return res.status(404).json({ message: "Partner-up not found" });
    }

    // Ensure only creator can respond
    const creator = await PartnerUpMember.findOne({
      partnerUp: partnerUpId,
      user: userId,
      role: "creator",
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

/* =========================
   Leave / Cancel Partner-Up
========================= */
export const leavePartnerUp = async (req, res) => {
  try {
    const { partnerUpId } = req.params;
    const userId = req.user.id;

    await PartnerUpMember.deleteOne({
      partnerUp: partnerUpId,
      user: userId,
    });

    const partnerUp = await PartnerUp.findById(partnerUpId);
    if (!partnerUp) return res.sendStatus(204);

    const acceptedCount = await PartnerUpMember.countDocuments({
      partnerUp: partnerUpId,
      status: "accepted",
    });

    if (acceptedCount < partnerUp.maxMembers) {
      partnerUp.status = "open";
      await partnerUp.save();
    }

    return res.status(200).json({ message: "Left partner-up" });
  } catch (error) {
    console.error("Leave PartnerUp Error:", error);
    return res.status(500).json({ message: "Failed to leave partner-up" });
  }
};
