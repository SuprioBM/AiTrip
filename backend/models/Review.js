import mongoose from "mongoose";

// Defines the structure of review documents including user, location, rating, and engagement metrics
const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  locationId: {
    type: String,
    required: true,
  },
  locationName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    enum: ["host", "partner", "location"],
    default: "location",
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

// Database index for fast queries by locationId and newest reviews first
reviewSchema.index({ locationId: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
