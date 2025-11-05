import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "Host" },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  price: { type: Number, default: 0 },
  paymentInfo: { type: Object }, // placeholder for payment gateway data
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", bookingSchema);
