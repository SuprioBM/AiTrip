// src/Pages/Auth/Oauth.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const provider = params.get("provider");

    if (!token) {
      navigate("/login");
      return;
    }

    const decodeJWT = (token) => {
      try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
      } catch (err) {
        console.error("Failed to decode JWT", err);
        return null;
      }
    };

    const decoded = decodeJWT(token);
    console.log(decoded);
    

    const userData = {
      email: decoded?.email || "User",
      role: decoded?.role || "user",
      provider,
    };

    // Save to context & localStorage
    login(token, userData);

    // Redirect to dashboard
    navigate("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run once

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p>Logging you in...</p>
    </div>
  );
}
