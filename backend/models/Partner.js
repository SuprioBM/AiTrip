import mongoose from "mongoose";

/* =========================
   PartnerUp (Group)
========================= */

const partnerUpSchema = new mongoose.Schema({
  placeId: {
    type: String,
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

  numberOfPeople: Number,

  budgetRange: {
    min: Number,
    max: Number,
  },

  numberOfDays: Number,

  startDate: Date,
  endDate: Date,

  // ✅ GEOJSON LOCATION (FIX)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
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

  // Snapshot of place for this member's request (helps know exact place they joined for)
  placeName: {
    type: String,
  },

  location: {
    lat: Number,
    lon: Number,
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
partnerUpSchema.index({ location: "2dsphere" });
partnerUpMemberSchema.index({ partnerUp: 1, user: 1 }, { unique: true });


/* =========================
   Exports
========================= */

export const PartnerUp = mongoose.model("PartnerUp", partnerUpSchema);
export const PartnerUpMember = mongoose.model(
  "PartnerUpMember",
  partnerUpMemberSchema
);
