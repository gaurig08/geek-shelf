# 📚 Geek Shelf 
A full-stack media tracking web app where users can search, add, and organize their favorite books, movies, and anime in one place. Built with React.js, Firebase (Auth + Firestore), and Vercel serverless functions for API integration.


## ✨ Features    

🔑 Authentication

- Secure login using Firebase Authentication (Google login supported).

- User-specific shelves, so data is private and personalized.

📂 Database (Cloud Firestore)

- Real-time syncing of user shelves.

- CRUD operations: Add, update, delete, and view items.

- Organized collections for books, movies, anime.

🌐 External API Integration

- TMDB API → fetch movies/TV shows.

- Google Books API → search books.

- Jikan API → get anime details.

- API calls handled via Vercel serverless routes (keeps API keys secure).

🎨 Frontend (React + Tailwind CSS)

- Optimized for desktops only (not mobile responsive).

- Smooth transitions (< 2s).

- Categorization by genre/type.

☁️ Deployment

- Hosted on Vercel with live continuous deployment.

## ⚙️ Tech Stack

| Layer          | Technology / Tool                         |
| -------------- | ----------------------------------------- |
| **Frontend**   | React, Vite                               |
| **Styling**    | Tailwind CSS, CSS Modules                 |
| **Animations** | Framer Motion                             |
| **Auth**       | Firebase Authentication (google login) |
| **Database**   | Cloud Firestore (NoSQL, cloud-hosted)     |
| **Audio**      | Web Audio API                             |
| **Routing**    | React Router DOM                          |
| **Deployment** | Vercel                                    |
<br>

## 🌐View the Project
You can view the hosted version here:  
🔗[Geek Shelf on Vercel](https://geek-shelf.vercel.app/)   
<br>

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



