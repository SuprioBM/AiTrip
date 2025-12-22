import express from "express";
import {
  getUserNotifications,
  markNotificationRead,
} from "../controllers/notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Protect all notification routes
router.use(protect);

// Get current user's notifications
router.get("/", getUserNotifications);

// Mark a notification as read
router.patch("/:id/read", markNotificationRead);

export default router;
