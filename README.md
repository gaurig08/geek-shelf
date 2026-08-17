# 📚 GeekShelf

A full-stack media tracking web app where users can search, add, and organize their favorite books, movies, and anime in one place. Built with React.js, Firebase (Auth + Firestore), and Vercel serverless functions for API integration.   

Live Link - https://geek-shelf.vercel.app/
## ✨ Features

🔑 **Authentication**
- Secure login using Firebase Authentication (Google login supported)
- User-specific shelves, so data is private and personalized

📂 **Database (Cloud Firestore)**
- Real-time syncing of user shelves
- CRUD operations: Add, update, delete, and view items
- Organized collections for books, movies, anime

🌐 **External API Integration**
- TMDB API → fetch movies/TV shows
- Google Books API → search books
- Jikan API → get anime details
- API calls routed through Vercel serverless functions, keeping API keys secure server-side

🤖 **Recommendation Engine**
- GeekShelf includes a recommendation feature to help users discover what to watch or read next:
- For **movies and anime**, recommendations are generated using similarity data from TMDB and Jikan (genre, themes, related titles).
- For **books**, since Google Books API doesn't provide strong similarity data on its own, recommendations are generated using **Gemini AI** - taking a user's existing shelf as context and generating relevant book suggestions.
- Genre labels across all three APIs are normalized into one consistent taxonomy before being used, since each source labels genres differently (e.g. TMDB's "Action & Adventure" vs. Jikan's "Shounen").

🎨 **Frontend (React + Tailwind CSS)**
- Optimized for desktops (mobile responsiveness planned as a next iteration)
- Smooth transitions (< 2s)
- Categorization by genre/type, normalized across all three source APIs

☁️ **Deployment**
- Hosted on Vercel with live CI/CD — every push to main auto-builds and deploys

## ⚙️ Tech Stack

| Layer          | Technology / Tool                      |
| -------------- | --------------------------------------- |
| **Frontend**   | React, Vite                            |
| **Styling**    | Tailwind CSS, CSS Modules              |
| **Animations** | Framer Motion                          |
| **Auth**       | Firebase Authentication (Google login) |
| **Database**   | Cloud Firestore (NoSQL, cloud-hosted)  |
| **Backend**    | Vercel Serverless Functions            |
| **Audio**      | Web Audio API                          |
| **Routing**    | React Router DOM                       |
| **Deployment** | Vercel                                 |

## 🏗️ How It Works

The frontend never calls external APIs directly — instead, it calls Vercel serverless functions (`/api/*`), which securely attach the real API keys server-side and forward the request to TMDB, Jikan, or Google Books. This keeps credentials out of the browser-visible frontend code. User data (shelves, items) lives in Firestore, structured as per-user subcollections, so each person's shelf is private and updates in real time via Firestore listeners.

## 🌐 Live Project

🔗 [GeekShelf on Vercel](https://geek-shelf.vercel.app/)

## 🏗️ Setup & Installation

### Prerequisites
- Node.js & npm installed
- Firebase project setup (Auth + Firestore)
- API keys for TMDB, Google Books, and Jikan

### Steps
```bash
# 1. Clone repo
git clone https://github.com/gaurig08/geek-shelf.git
cd geek-shelf

# 2. Install dependencies
npm install

# 3. Create .env.local file and add:
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
TMDB_API_KEY=xxxx
GOOGLE_BOOKS_API_KEY=xxxx

# 4. Run locally
npm run dev
```

## 📸 Screenshots
<img width="1920" height="1020" alt="Screenshot 2026-08-17 065832" src="https://github.com/user-attachments/assets/1a5f2913-a728-464b-aa15-67774df4830f" />


---
⭐️ Built by [Gauri G](https://github.com/gaurig08) — a personal project born from tracking anime, movies, and books across too many different apps.
