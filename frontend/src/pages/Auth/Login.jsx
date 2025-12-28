import React, { useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'
import { Mail, Lock, Eye, EyeOff, Chrome, LockIcon } from 'lucide-react'
import RegisterPage from './RegisterPage'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const { login, signInWithOAuth } = useAuth()

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStage, setForgotStage] = useState('request') // "request" | "verify" | "reset"
  const [forgotEmail, setForgotEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fpMsg, setFpMsg] = useState('')
  const [fpLoading, setFpLoading] = useState(false)

  // NOTE: Forgot password is a 3-step UI flow that relies on backend support:
  // 1) POST /auth/forgot-password { email } -> backend should email a verification code (or return a success)
  // 2) POST /auth/verify-reset-code { email, code } -> backend verifies the code
  // 3) POST /auth/reset-password { email, code, newPassword } -> backend updates the password
  // If any backend step is missing, the UI will surface the returned error via `fpMsg`.

  // TODO: fix the color contrast issues in dark mode
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const { data } = await API.post('/auth/login', { email, password })
      login(data.token, data.user)
      navigate('/HomePage')
    } catch (err) {
      setMsg(err.response?.data?.message || 'Login failed')
    }
  }

  const openForgot = () => {
    setForgotEmail(email || '')
    setVerificationCode('')
    setNewPassword('')
    setConfirmPassword('')
    setFpMsg('')
    setForgotStage('request')
    setForgotOpen(true)
  }

  const closeForgot = () => {
    setForgotOpen(false)
    setFpMsg('')
    setFpLoading(false)
  }

  // Step 1: send verification code to email (UI only triggers API)
  const handleSendVerification = async () => {
    if (!forgotEmail) {
      setFpMsg('Please enter your email address.')
      return
    }
    setFpLoading(true)
    setFpMsg('')
    try {
      // Backend should send a verification code to the email if it exists.
      // Note: some backends will always return success (to avoid email harvesting);
      // check backend docs if you see unexpected behavior.
      await API.post('/auth/forgot-password', { email: forgotEmail })
      setForgotStage('verify')
      setFpMsg('Verification code sent. Check your email.')
    } catch (err) {
      setFpMsg(err.response?.data?.message || 'Failed to send verification.')
    } finally {
      setFpLoading(false)
    }
  }

  // Step 2: verify code
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setFpMsg('Please enter the verification code.')
      return
    }
    setFpLoading(true)
    setFpMsg('')
    try {
      // Verify the code with backend. Backend must provide this endpoint.
      await API.post('/auth/verify-reset-code', {
        email: forgotEmail,
        code: verificationCode,
      })
      setForgotStage('reset')
      setFpMsg('Code verified. Enter your new password.')
    } catch (err) {
      setFpMsg(err.response?.data?.message || 'Invalid verification code.')
    } finally {
      setFpLoading(false)
    }
  }

  // Step 3: reset password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setFpMsg('Please fill both password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      setFpMsg('Passwords do not match.')
      return
    }
    setFpLoading(true)
    setFpMsg('')
    try {
      // Finalize reset: backend must accept email + code + newPassword and update the account.
      await API.post('/auth/reset-password', {
        email: forgotEmail,
        code: verificationCode,
        newPassword,
      })
      setFpMsg('Password reset successful. You can now sign in.')
      setTimeout(() => {
        closeForgot()
      }, 1200)
    } catch (err) {
      setFpMsg(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setFpLoading(false)
    }
  }

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
            onClick={() => setActiveTab('login')}
            className={`w-1/2 py-2 rounded-md font-semibold transition-all ${
              activeTab === 'login'
                ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.6)]'
                : 'text-gray-400 hover:text-red-400'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`w-1/2 py-2 rounded-md font-semibold transition-all ${
              activeTab === 'register'
                ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,0,0.6)]'
                : 'text-gray-400 hover:text-red-400'
            }`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
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
                  type={showPassword ? 'text' : 'password'}
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
                onClick={openForgot}
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
                onClick={() => signInWithOAuth('github')}
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
                onClick={() => signInWithOAuth('google')}
                className="w-full bg-black/40 hover:bg-gray-900 text-white border border-gray-700 hover:border-red-500 rounded-lg py-2 flex items-center justify-center gap-2 transition-all"
              >
                <Chrome className="w-5 h-5 text-gray-400" />
                Continue with Google
              </button>
            </div>
          </form>
        )}

        {/* Register Tab Placeholder */}
        {activeTab === 'register' && <RegisterPage />}
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeForgot}
          />
          <div className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-gray-900/90 to-black/80 border border-red-800/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(255,0,0,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Reset Password
              </h3>
              <button
                onClick={closeForgot}
                className="text-gray-400 hover:text-red-400"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Request Email Stage */}
            {forgotStage === 'request' && (
              <div>
                <p className="text-gray-300 mb-4">
                  Enter the email associated with your account. We'll send a
                  verification code if the email exists.
                </p>
                <label className="block text-gray-300 mb-1">Email</label>
                <div className="relative mb-4">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-gray-800/50 text-white rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-red-500 border border-gray-700 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSendVerification}
                    disabled={fpLoading}
                    className="ml-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {fpLoading ? 'Sending...' : 'Send Verification'}
                  </button>
                </div>
              </div>
            )}

            {/* Verify Code Stage */}
            {forgotStage === 'verify' && (
              <div>
                <p className="text-gray-300 mb-4">
                  We sent a code to{' '}
                  <span className="text-white">{forgotEmail}</span>. Enter it
                  below to verify.
                </p>
                <label className="block text-gray-300 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full bg-gray-800/50 text-white rounded-lg pl-3 pr-3 py-2 mb-4 focus:ring-2 focus:ring-red-500 border border-gray-700 outline-none transition-all"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setForgotStage('request')}
                    className="bg-gray-800/60 text-gray-300 py-2 px-4 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyCode}
                    disabled={fpLoading}
                    className="ml-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {fpLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Reset Password Stage */}
            {forgotStage === 'reset' && (
              <div>
                <p className="text-gray-300 mb-4">
                  Enter a new password for your account.
                </p>

                <label className="block text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-800/50 text-white rounded-lg pl-3 pr-3 py-2 mb-3 focus:ring-2 focus:ring-red-500 border border-gray-700 outline-none transition-all"
                />

                <label className="block text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-800/50 text-white rounded-lg pl-3 pr-3 py-2 mb-4 focus:ring-2 focus:ring-red-500 border border-gray-700 outline-none transition-all"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setForgotStage('verify')}
                    className="bg-gray-800/60 text-gray-300 py-2 px-4 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={fpLoading}
                    className="ml-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {fpLoading ? 'Saving...' : 'Save New Password'}
                  </button>
                </div>
              </div>
            )}

            {fpMsg && (
              <p className="text-center text-red-400 text-sm mt-4">{fpMsg}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
