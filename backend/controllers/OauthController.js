import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import User from "../models/User.js";

dotenv.config();

// Helper to generate JWT for your app
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};
// Redirect user to Google OAuth page
export const googleAuth = (req, res) => {
  const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
  res.redirect(redirectUri);
};

// Redirect user to GitHub OAuth page
export const githubAuth = (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user:email`;
  res.redirect(redirectUri);
};

// Callback handler for both providers
export const oauthCallback = async (req, res, next) => {
  const { provider } = req.params;
  const { code } = req.query;
  

  if (!code) return res.status(400).json({ message: "No code provided" });

  try {
    let email, name;

    switch (provider) {
      case "google":
        // Exchange code for token
        const googleRes = await axios.post(
          "https://oauth2.googleapis.com/token",
          {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
          }
        );

        const googleUser = await axios.get(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: { Authorization: `Bearer ${googleRes.data.access_token}` },
          }
        );

        email = googleUser.data.email;
        name = googleUser.data.name;
        break;

      case "github":
        
        // Exchange code for token
        const githubTokenRes = await axios.post(
          "https://github.com/login/oauth/access_token",
          {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          },
          { headers: { Accept: "application/json" } }
        );

        const githubUser = await axios.get("https://api.github.com/user", {
          headers: {
            Authorization: `token ${githubTokenRes.data.access_token}`,
          },
        });

        const githubEmails = await axios.get(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `token ${githubTokenRes.data.access_token}`,
            },
          }
        );

        email = githubEmails.data.find((e) => e.primary).email;
        name = githubUser.data.name || githubUser.data.login;
        break;

      default:
        return res.status(400).json({ message: "Unsupported provider" });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        isVerified: true,
        password: "oauth_user", // placeholder
      });
    }

    // Generate JWT
    const token = generateToken(user);
   console.log("here reached");
   
    // Redirect frontend with token
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth?token=${token}&provider=${provider}`
    );
  } catch (err) {
    next(err);
  }
};
