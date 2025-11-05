# AiTrip Backend

Node.js + Express backend for AiTrip (MERN + Vite frontend).

Features implemented in scaffold:

- Auth (register/login/verify/forgot/reset) with nodemailer (Gmail example)
- JWT role-based auth middleware
- Models: User, Trip, Location, Host, Booking, Partner, Review
- CRUD routes for models and admin analytics endpoints
- AI trip generation controller (OpenAI example)
- Error handling middleware

.env.example included.

Getting started:

1. Copy `.env.example` to `.env` and fill values (MONGO_URI, JWT_SECRET, EMAIL_USER/PASS, OPENAI_API_KEY).
2. Install dependencies: npm install
3. Run dev server: npm run dev

Notes:

- AI generation currently uses the OpenAI SDK; replace the model and parsing with production-grade logic.
- Payment integration is a placeholder; integrate with Stripe/PayPal as needed.
