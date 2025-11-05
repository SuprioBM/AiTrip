import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  preferences: { type: Object },
  itinerary: { type: Array }, // array of itinerary items with coordinates
  totalDays: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Trip', tripSchema);
