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

<img width="500" height="450" alt="Screenshot 2025-09-25 092424" src="https://github.com/user-attachments/assets/54924b5f-b3c0-411c-b827-85170dbef630" />
<img width="500" height="450" alt="Screenshot 2025-09-25 092439" src="https://github.com/user-attachments/assets/78b564dd-a53c-4f8b-a8b9-6f0e8ca6b2aa" />
<img width="500" height="450" alt="Screenshot 2025-09-25 092720" src="https://github.com/user-attachments/assets/02072539-d449-4a0d-864e-e10be9d29179" />
<img width="500" height="450" alt="Screenshot 2025-09-25 092816" src="https://github.com/user-attachments/assets/2517d68c-9f2a-4a82-b861-a3211be8b137" />




