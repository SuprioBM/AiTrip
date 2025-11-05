import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  coordinates: { lat: Number, lng: Number },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Location", locationSchema);
