import express from "express";
import {
  register,
  verify,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { oauthLogin } from "../controllers/OauthController.js";


const router = express.Router();

router.post("/register", register);
router.post("/verify", verify);
router.post("/login", login);
router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword);
router.post("/oauth-login", oauthLogin);

export default router;
