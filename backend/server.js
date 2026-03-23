import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import hostRoutes from "./routes/hostRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();
const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/hosts", hostRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/partnerup", partnerRoutes);
app.use("/partnerup", partnerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/localhosts", hostRoutes);
app.use("/api/partner-ups", partnerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/trip", tripRoutes);
import mongoose from "mongoose";

app.get("/health", async (req, res) => {
  let mongoStatus = "down";
  let supabaseStatus = "down";

  // ✅ Check Mongo
  try {
    if (mongoose.connection.readyState === 1) {
      mongoStatus = "up";
    }
  } catch (e) {
    mongoStatus = "down";
  }

  // ✅ Check Supabase
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
        },
      }
    );

    if (response.ok || response.status === 401) {
      supabaseStatus = "up";
    }
  } catch (e) {
    supabaseStatus = "down";
  }

  const isHealthy = mongoStatus === "up" && supabaseStatus === "up";

  return res.status(isHealthy ? 200 : 500).json({
    ok: isHealthy,
    services: {
      mongo: mongoStatus,
      supabase: supabaseStatus,
    },
  });
});
// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
