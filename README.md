# AiTrip (Full-stack MERN + Vite Project)

This workspace contains two folders: `backend` and `frontend`.

Backend (Node/Express/MongoDB):

- Folder: `backend`
- Start: open terminal, cd into `backend`, run `npm install` then `npm run dev`
- Copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `OPENAI_API_KEY`.

Frontend (Vite + React):

- Folder: `frontend`
- Start: open terminal, cd into `frontend`, run `npm install` then `npm run dev`

Notes & next steps:

- AI generation uses OpenAI SDK; add your API key and refine prompt + parsing.
- Payment integration is placeholder.
- Add tests and CI as needed.
