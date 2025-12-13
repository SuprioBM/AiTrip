import express from "express";
import {
  createPartnerUp,
  getPartnerUpsByPlace,
  requestToJoinPartnerUp,
  respondToJoinRequest,
  leavePartnerUp,
} from "../controllers/partnerUp.js";


const router = express.Router();

/* =========================
   Routes
========================= */

// Create partner-up


// Get partner-ups for a place
router.get("/place/:placeId", getPartnerUpsByPlace);

// Request to join
router.post("/:partnerUpId/join", requestToJoinPartnerUp);

// Accept / Reject join request
router.patch("/:partnerUpId/member/:memberId", respondToJoinRequest);

// Leave / cancel
router.delete("/:partnerUpId/leave", leavePartnerUp);

export default router;
