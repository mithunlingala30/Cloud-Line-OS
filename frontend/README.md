# Cloudline — Frontend

A React + Vite frontend for the coding judge, styled as a "clear skies"
theme instead of a LeetCode clone: sky gradients, drifting cloud shapes, and
weather-based difficulty badges (☀️ Easy / ⛅ Medium / ⛈️ Hard).

## Setup

```bash
cd leetcode-frontend
npm install
cp .env.example .env     # point VITE_API_URL at your backend if not on localhost:8000
npm run dev
```

Visit `http://localhost:5173`.

## What's here

- **Problem list** (`/`) — search + difficulty filter over all seeded problems
- **Problem detail** (`/problems/:id`) — description on the left, a CodeMirror
  editor with a language picker (Python/C/C++/Java) on the right, plus Run
  (tests against the first example) and Submit (grades against all test cases,
  shows a verdict, saves to Firestore via the backend)
- **Login** (`/login`) — optional Firebase email/password + Google sign-in, so
  submissions can be tied to a user

## Connecting to the backend

All problem data and code execution goes through the FastAPI backend built
earlier (`/problems`, `/run`, `/submit`) — this frontend does not talk to
Firestore directly for problems/submissions, only for auth. Make sure:

1. The backend is running (`uvicorn app.main:app --reload`)
2. `seed/seed_problems.py` has been run so `/problems` returns data
3. `VITE_API_URL` in `.env` points at the backend

## Customizing the theme

All design tokens (colors, fonts, radii, shadows) live in
`src/styles/theme.css` as CSS variables — change them there to retheme the
whole app. The drifting cloud animation is in
`src/components/CloudBackground.jsx` / `.css`.

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — deploy anywhere that serves static sites
(Vercel, Netlify, Firebase Hosting, etc.). Remember to set `VITE_API_URL` to
your deployed backend's URL at build time.
