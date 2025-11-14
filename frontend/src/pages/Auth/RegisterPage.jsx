// src/Pages/Auth/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Chrome, CheckCircle2 } from "lucide-react";
import API from "../../api";

export default function RegisterPage() {
  const navigate = useNavigate();

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [msg, setMsg] = useState("");

  // -------- Normal registration --------
  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");

    if (password !== confirmPassword) {
      setMsg("Passwords don't match!");
      return;
    }
    if (password.length < 8) {
      setMsg("Password must be at least 8 characters long!");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await API.post("/auth/register", { name, email, password });
      setMsg(data.message || "Registered successfully!");
      setShowVerification(true);
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed!");
    } finally {
      setIsLoading(false);
    }
  };

  // -------- Verification --------
const handleVerification = async (e) => {
  e.preventDefault();
  setMsg("");

  if (verificationCode.length !== 5) {
    setMsg("Please enter a valid 5-digit code");
    return;
  }

  try {
    setIsLoading(true);

    const { data } = await API.post("/auth/verify", {
      email,
      code: verificationCode,
    });

    setMsg(data.message || "Email verified successfully!");
    setIsVerified(true);

    // Redirect after a short delay
    setTimeout(() => navigate("/dashboard"), 1500);
  } catch (err) {
    console.error(err);
    setMsg(err.response?.data?.message || "Verification failed!");
  } finally {
    setIsLoading(false);
  }
};




  // -------- Verified UI --------
  if (isVerified) {
    return (
      <div className="text-center space-y-4 py-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-600 mb-4 animate-pulse">
          <CheckCircle2 className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-red-500">Account Created!</h3>
        <p className="text-gray-300">
          Your account has been successfully created and verified.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,0,0,0.7)] transition-all"
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  // -------- Verification UI --------
 if (showVerification) {
   return (
     <form onSubmit={handleVerification} className="space-y-5 animate-fade-in">
       <div className="text-center space-y-2 mb-6">
         <Mail className="w-12 h-12 text-red-500 mx-auto mb-2 animate-pulse" />
         <h3 className="text-xl font-semibold text-red-500">
           Verify Your Email
         </h3>
         <p className="text-gray-300 text-sm">
           We've sent a 5-digit code to{" "}
           <span className="text-red-500">{email}</span>
         </p>
       </div>

       {msg && <p className="text-center text-red-400 text-sm">{msg}</p>}

       <div className="space-y-2">
         <label htmlFor="code" className="block text-gray-300">
           Verification Code
         </label>
         <input
           id="code"
           type="text"
           placeholder="000000"
           maxLength={5}
           value={verificationCode}
           onChange={(e) =>
             setVerificationCode(e.target.value.replace(/\D/g, ""))
           }
           className="w-full py-2 px-3 rounded-lg bg-gray-800/50 text-white text-center focus:ring-2 focus:ring-red-500 outline-none"
           required
         />
       </div>

       <button
         type="submit"
         disabled={verificationCode.length !== 5 || isLoading}
         className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,0,0,0.7)] transition-all"
       >
         Verify Email
       </button>

       <button
         type="button"
         onClick={() => setShowVerification(false)}
         className="w-full text-sm text-gray-400 hover:text-red-400 transition-colors"
       >
         Change email address
       </button>
     </form>
   );
 }


  // -------- Registration Form --------
  return (
    <form
      className="w-full max-w-md mt-4 bg-gradient-to-b from-gray-900/80 to-black/70 backdrop-blur-xl border border-red-800/40 rounded-2xl shadow-[0_0_30px_rgba(255,0,0,0.2)] p-8 space-y-5"
      onSubmit={handleRegister}
    >
      <h2 className="text-2xl font-bold text-red-500 text-center mb-4">
        Create Account
      </h2>

      {msg && <p className="text-center text-red-400 text-sm">{msg}</p>}

      {/* Name */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
          required
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
          required
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
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

      {/* Confirm Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition"
        >
          {showConfirmPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Register Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,0,0,0.7)] transition-all"
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black/70 px-2 text-gray-400">
            Or register with
          </span>
        </div>
      </div>

      {/* OAuth Buttons */}
      {/* Gmail Sign-In */}
      <div className="flex flex-col gap-3">
        {/* GitHub */}
        <button
          type="button"
          onClick={() =>
            (window.location.href = `http://localhost:5000/api/auth/oauth/github`)
          }
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
          onClick={() =>
            (window.location.href = `http://localhost:5000/api/auth/oauth/google`)
          }
          className="w-full bg-black/40 hover:bg-gray-900 text-white border border-gray-700 hover:border-red-500 rounded-lg py-2 flex items-center justify-center gap-2 transition-all"
        >
          <Chrome className="w-5 h-5 text-gray-400" />
          Continue with Google
        </button>
      </div>
    </form>
  );
}
