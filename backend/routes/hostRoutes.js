import express from "express";
import { getLocalhostsByLocation } from "../controllers/localHost.js";

const router = express.Router();

// GET /api/localhosts/dha
router.get("/:locationCode", getLocalhostsByLocation);

export default router;
