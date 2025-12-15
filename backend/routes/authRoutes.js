import express from 'express'
import {
  register,
  verify,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../controllers/authController.js'
import { oauthLogin } from '../controllers/OauthController.js'

const router = express.Router()

router.post('/register', register)
router.post('/verify', verify)
router.post('/login', login)

// Code-based reset flow used by the frontend modal:
router.post('/forgot-password', forgotPassword) // handleSendVerification
router.post('/verify-reset-code', verifyResetCode) // handleVerifyCode
router.post('/reset-password', resetPassword) // handleResetPassword

// Keep token-based link flow (optional)
router.post('/reset/:token', resetPassword)

router.post('/oauth-login', oauthLogin)

export default router
