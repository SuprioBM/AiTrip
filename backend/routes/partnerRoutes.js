import express from "express";
import {
  createPartnerUp,
  requestToJoinPartnerUp,
  respondToJoinRequest,
  searchPartnerUps,
  getPartnerUpMembers,
} from "../controllers/partnerUp.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   Routes
========================= */

// Create partner-up (frontend posts to /partnerup/create)
router.post("/create", protect, createPartnerUp);

// Search partner-ups (frontend posts to /partnerup/search)
router.post("/search", protect, searchPartnerUps);



// Request to join (frontend posts to /partnerup/request/:partnerUpId)
router.post("/request/:partnerUpId", protect, requestToJoinPartnerUp);

// Accept / Reject join request
router.patch("/:partnerUpId/member/:memberId", respondToJoinRequest);

// Get partner-up members
router.get("/:partnerUpId/members", getPartnerUpMembers);
export default router;
