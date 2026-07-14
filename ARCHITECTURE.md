# GeekShelf — Architecture

## Overview
GeekShelf is a media-tracking app for books, movies, series, and anime. Users
authenticate with Firebase, and their shelves are stored per-user in Firestore.
External media data (search results, posters, genres) comes from three
third-party APIs, proxied through Vercel serverless functions to keep API
keys off the client.

## Data flow

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────────────┐
│   Browser    │────▶│  Firebase Auth    │     │  Vercel Serverless      │
│  (React/Vite)│     │  (Google sign-in) │     │  /api/tmdb, /api/books  │
└──────┬───────┘     └──────────────────┘     └───────────┬────────────┘
       │                                                    │
       │  authenticated reads/writes                        │  proxied requests
       ▼                                                    ▼
┌──────────────┐                                  ┌──────────────────────┐
│  Firestore    │                                  │ TMDB / Google Books /│
│ users/{uid}/  │                                  │ Jikan (anime) APIs   │
│   shelf/{id}  │                                  └──────────────────────┘
└──────────────┘
```

- **Auth**: Firebase Authentication (Google provider). `AuthProvider.jsx` wraps
  the app and gates routes via `PrivateRoute.jsx`.
- **Storage**: Firestore, scoped per user (`users/{uid}/shelf/{itemId}`).
  Each shelf item stores title, poster, category, status, summary, and genre.
- **External APIs**: TMDB (movies/series) and Google Books are proxied through
  `/api/tmdb.js` and `/api/books.js` so the API keys never reach the client.
  Jikan (anime) is public/keyless and called directly.
- **Recommendations**: `recommendationEngine.js` builds a genre-weight profile
  from the user's shelf (completed items weigh more than "planning"), fetches
  a candidate pool from TMDB's discover endpoint for the user's top genre, and
  ranks candidates by genre overlap. Deliberately simple and explainable
  rather than a black-box model — every recommendation can be traced back to
  "you added N things tagged this genre."
- **Caching**: `apiCache.js` is a small in-memory TTL cache wrapping repeated
  API calls (e.g. recommendation candidate fetches) to cut redundant network
  requests within a session.

## Why this stack
- Firebase Auth + Firestore avoids building and hosting a custom backend for
  what is fundamentally per-user CRUD data — appropriate scope for the
  problem size.
- Serverless proxy routes keep third-party API keys server-side without
  standing up a full backend service.
- Content-based recommendation (genre overlap) was chosen over collaborative
  filtering or an LLM call because the app has no cross-user interaction data
  yet, and a transparent scoring method is something I can fully explain and
  defend rather than treat as a black box.

## Testing
Pure logic (recommendation scoring, caching) is covered by Vitest unit tests
in `src/utils/__tests__/`. Firebase-dependent code is not yet unit tested —
next step would be mocking the Firestore SDK or extracting more logic into
pure functions.
