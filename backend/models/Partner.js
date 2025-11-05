import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  companyName: String,
  verified: { type: Boolean, default: false },
  feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Partner", partnerSchema);
