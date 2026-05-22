# Pulse Learn AI

This repository was scaffolded from the Pulse Learn PRD. It contains a React + Vite frontend and an Express backend wired for Supabase, Gemini-style AI services, and Stellar testnet credential anchoring.

## Structure

- `client/` - React Vite frontend
- `server/` - Express backend for API routes, file upload, Supabase, and Stellar
- `ai/` - product docs and PRD files

## Setup

1. Copy environment variables from `server/.env.example` to `server/.env` and from `client/.env.example` to `client/.env`.
2. Fill in your Supabase project values and any backend secrets.
3. Install dependencies:
   - `cd server && npm install`
   - `cd ../client && npm install`
4. Run the backend:
   - `cd server && npm run dev`
5. Run the frontend:
   - `cd client && npm run dev`

## Environment variables

- `server/.env`: backend credentials for Supabase, Stellar, and client origin.
  - Required values:
    - `SUPABASE_URL`: your Supabase project URL.
    - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key for backend access.
    - `CLIENT_URL`: frontend origin for CORS, typically `http://localhost:5173`.
    - `PORT`: backend port, typically `3001`.
    - `WALLET_SECRET`: secret key for the Stellar account used to mint receipts.
    - `STELLAR_HORIZON_URL`: optional Horizon endpoint, defaults to `https://horizon-testnet.stellar.org`.
- `client/.env`: frontend values for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL`.
  - Required values:
    - `VITE_SUPABASE_URL`: your Supabase project URL.
    - `VITE_SUPABASE_ANON_KEY`: Supabase anonymous public key.
    - `VITE_API_URL`: backend API base URL, typically `http://localhost:3001/api`.

## User flow

1. Open the frontend and sign in or create a Supabase user.
2. Upload a syllabus PDF or paste syllabus text.
3. Generate a roadmap, answer quiz prompts, and mint your Stellar receipt.

## Notes

- Backend routes are located in `server/routes/`
- AI logic and integrations are stubbed in `server/services/`
- Frontend components are scaffolded under `client/src/components/`
