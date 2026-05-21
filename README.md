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

## Notes

- Backend routes are located in `server/routes/`
- AI logic and integrations are stubbed in `server/services/`
- Frontend components are scaffolded under `client/src/components/`
