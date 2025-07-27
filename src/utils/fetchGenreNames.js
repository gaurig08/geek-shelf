// src/utils/fetchGenreNames.js

const fetchTMDBGenres = async () => {
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`;
    const response = await fetch(url);
    const data = await response.json();
    return data.genres.map(genre => genre.name);  // Return genre names as an array
  };
  
  const fetchGoogleBooksGenres = async (category) => {
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${category}&key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.items?.[0]?.volumeInfo?.categories || []; // Return categories (genres) as an array
  };
  
  const fetchAnimeGenres = async () => {
    const url = 'https://api.jikan.moe/v4/genres/anime';
    const response = await fetch(url);
    const data = await response.json();
    return data.data.map((genre) => genre.name);  // Return anime genre names
  };
  
  const fetchGenres = async (category, type) => {
    if (type === 'movie' || type === 'tv') {
      return fetchTMDBGenres(); // Fetch genres from TMDB for movies/series
    } else if (type === 'book') {
      return fetchGoogleBooksGenres(category); // Fetch genres from Google Books
    } else if (type === 'anime') {
      return fetchAnimeGenres(); // Fetch genres from Anime API
    }
    return [];
  };
  
  export { fetchGenres };
  