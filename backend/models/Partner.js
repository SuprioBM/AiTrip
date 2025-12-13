import mongoose from "mongoose";

/* =========================
   PartnerUp (Group)
========================= */

const partnerUpSchema = new mongoose.Schema({
  placeId: {
    type: String, // external place id OR lat-lng hash
    required: true,
    index: true,
  },

  placeName: {
    type: String,
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  maxMembers: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ["open", "full", "closed"],
    default: "open",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* =========================
   PartnerUpMember (Users)
========================= */

const partnerUpMemberSchema = new mongoose.Schema({
  partnerUp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PartnerUp",
    required: true,
    index: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  role: {
    type: String,
    enum: ["creator", "member"],
    default: "member",
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

/* =========================
   Indexes
========================= */

// Prevent same user joining same partner-up twice
partnerUpMemberSchema.index({ partnerUp: 1, user: 1 }, { unique: true });

/* =========================
   Exports
========================= */

export const PartnerUp = mongoose.model("PartnerUp", partnerUpSchema);
export const PartnerUpMember = mongoose.model(
  "PartnerUpMember",
  partnerUpMemberSchema
);
