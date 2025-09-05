// src/utils/fetchGenreNames.js

// 🎬 TMDB Genres
const fetchTMDBGenres = async () => {
  const response = await fetch(`/api/tmdb?path=/genre/movie/list&language=en-US`);
  const data = await response.json();
  return data.genres.map((genre) => genre.name); // Return genre names as an array
};

// 📚 Google Books Genres
const fetchGoogleBooksGenres = async (category) => {
  const response = await fetch(`/api/books?path=/volumes&q=subject:${category}`);
  const data = await response.json();
  return data.items?.[0]?.volumeInfo?.categories || []; // Return categories (genres) as an array
};

// 🎌 Anime Genres
const fetchAnimeGenres = async () => {
  const response = await fetch("https://api.jikan.moe/v4/genres/anime"); // no secret key needed
  const data = await response.json();
  return data.data.map((genre) => genre.name); // Return anime genre names
};

// 🔄 Unified fetch
const fetchGenres = async (category, type) => {
  if (type === "movie" || type === "tv") {
    return fetchTMDBGenres();
  } else if (type === "book") {
    return fetchGoogleBooksGenres(category);
  } else if (type === "anime") {
    return fetchAnimeGenres();
  }
  return [];
};

export { fetchGenres };
