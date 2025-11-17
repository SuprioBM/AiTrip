import React, { useState } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api";
import { Mail, Lock, Eye, EyeOff, Chrome, LockIcon } from "lucide-react";
import RegisterPage from "./RegisterPage";



export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { login,signInWithOAuth } = useAuth();
  
  // TODO: fix the color contrast issues in dark mode
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await API.post("/auth/login", { email, password });
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
    }
  };

 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-950 relative">
      {/* Glowing lock icon */}
      <div className="absolute top-10 flex flex-col items-center">
        <LockIcon className="text-red-500 w-12 h-12 mb-3 animate-pulse drop-shadow-[0_0_10px_rgba(255,0,0,0.6)]" />
        <h1 className="text-4xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
          SecureAuth
        </h1>
        <p className="text-gray-300 mt-2">
          Welcome back! Please sign in to continue
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md mt-40 bg-gradient-to-b from-gray-900/80 to-black/70 backdrop-blur-xl border border-red-800/40 rounded-2xl shadow-[0_0_30px_rgba(255,0,0,0.2)] p-8">
        {/* Tabs */}
        <div className="flex mb-6 bg-black/30 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("login")}
            className={`w-1/2 py-2 rounded-md font-semibold transition-all ${
              activeTab === "login"
                ? "bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.6)]"
                : "text-gray-400 hover:text-red-400"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`w-1/2 py-2 rounded-md font-semibold transition-all ${
              activeTab === "register"
                ? "bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.6)]"
                : "text-gray-400 hover:text-red-400"
            }`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800/50 text-white rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-red-500 border border-gray-700 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800/50 text-white rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-red-500 border border-gray-700 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right mb-6">
              <button
                type="button"
                className="text-sm text-red-400 hover:text-red-300 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,0,0,0.7)] transition-all duration-300"
            >
              Sign In
            </button>

            {/* Error Message */}
            {msg && (
              <p className="text-center text-red-400 text-sm mt-3">{msg}</p>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/70 px-2 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* GitHub */}
              <button
                type="button"
                onClick={() => signInWithOAuth("github")}
                className="w-full bg-black/40 hover:bg-gray-900 text-white border border-gray-700 hover:border-red-500 rounded-lg py-2 flex items-center justify-center gap-2 transition-all"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .5A12 12 0 0 0 0 12.7c0 5.4 3.4 9.9 8 11.5.6.1.8-.3.8-.6v-2c-3.3.8-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.3 1.8 1.3 1 .1.5 1.8 2.4 2.6.2-.8.4-1.3.8-1.7-2.6-.3-5.3-1.4-5.3-6A4.7 4.7 0 0 1 5 9.4a4.3 4.3 0 0 1 .1-3.2s1-.3 3.2 1.3c.9-.3 2-.4 3.1-.4s2.2.2 3 .4C16.6 6 17.7 6.2 17.7 6.2a4.6 4.6 0 0 1 .2 3.2 4.7 4.7 0 0 1 1.2 3.4c0 4.7-2.7 5.6-5.3 6a3.1 3.1 0 0 1 .9 2.4v3.6c0 .3.2.7.8.6 4.6-1.7 8-6.1 8-11.5A12 12 0 0 0 12 .5Z" />
                </svg>
                Continue with GitHub
              </button>

              {/* Google */}
              <button
                type="button"
                onClick={() => signInWithOAuth("google")}
                className="w-full bg-black/40 hover:bg-gray-900 text-white border border-gray-700 hover:border-red-500 rounded-lg py-2 flex items-center justify-center gap-2 transition-all"
              >
                <Chrome className="w-5 h-5 text-gray-400" />
                Continue with Google
              </button>
            </div>
          </form>
        )}

        {/* Register Tab Placeholder */}
        {activeTab === "register" && <RegisterPage />}
      </div>
    </div>
  );
}
