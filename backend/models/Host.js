import mongoose from "mongoose";

const localhostSchema = new mongoose.Schema({
  _id: {
    type: String, // eg: "dh01", "dh02", "lon01"
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
  },

  phone: {
    type: String,
  },

  locationCode: {
    type: String, // eg: "dh", "lon", "ban"
    required: true,
    index: true,
  },

  locationName: {
    type: String, // eg: "Dhaka", "London"
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Localhost", localhostSchema);
