import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  targetType: { type: String, enum: ["host", "partner", "location"] },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Review", reviewSchema);
