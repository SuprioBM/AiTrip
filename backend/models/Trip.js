import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  locationName: {
    type: String,
    required: true,
  },

  placeId: {
    type: String, // external placeId or hash
    required: true,
    index: true,
  },

  selectedPins: [
    {
      category: String, // place_of_worship, museum, etc
      name: String, // name of the place
      location: {
        lat: Number,
        lon: Number,
      },
      photos: [String], // array of photo URLs
      shortDescription: String, // short description
      wikipediaUrl: { type: String, default: null },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user cannot save duplicate trip for same place
tripSchema.index({ user: 1, placeId: 1 }, { unique: true });

export default mongoose.model("Trip", tripSchema);
