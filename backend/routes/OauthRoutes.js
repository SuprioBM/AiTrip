import express from "express";
import {
  googleAuth,
  githubAuth,
  oauthCallback,
} from "../controllers/OauthController.js";

const router = express.Router();

// Initiate OAuth login
router.get("/google", googleAuth);
router.get("/github", githubAuth);

// Callback endpoint for providers
router.get("/callback/:provider", oauthCallback);

export default router;
