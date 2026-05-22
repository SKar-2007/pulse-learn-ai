# Pulse Learn AI

This repository was scaffolded from the Pulse Learn PRD. It contains a React + Vite frontend and an Express backend wired for Supabase, Gemini-style AI services, and Stellar testnet credential anchoring.

## Structure

- `client/` - React Vite frontend
- `server/` - Express backend for API routes, file upload, Supabase, and Stellar
- `ai/` - product docs and PRD files

## Setup

1. Copy environment variables into `server/.env` and `client/.env`.
2. Install dependencies:
   - `cd server && npm install`
   - `cd ../client && npm install`
3. Run the backend:
   - `cd server && npm run dev`
4. Run the frontend:
   - `cd client && npm run dev`

## Environment variables

- `server/.env`: backend credentials for Supabase, Stellar, and client origin.
  - Required Stellar values:
    - `WALLET_SECRET`: secret key for the Stellar account used to mint receipts.
    - `STELLAR_HORIZON_URL`: optional Horizon endpoint, defaults to `https://horizon-testnet.stellar.org`.
- `client/.env`: frontend values for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL`.

## User flow

1. Open the frontend and sign in or create a Supabase user.
2. Upload a syllabus PDF or paste syllabus text.
3. Generate a roadmap, answer quiz prompts, and mint your Stellar receipt.

## Notes

- Backend routes are located in `server/routes/`
- AI logic and integrations are stubbed in `server/services/`
- Frontend components are scaffolded under `client/src/components/`
