import { useState, useEffect } from "react";

const MovieList = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // ✅ Call your backend API route instead of TMDB directly
        const response = await fetch(`/api/tmdb?path=/search/movie&query=Inception`);
        const data = await response.json();

        setMovies(data.results || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div>
      <h2>Movie Results</h2>
      <div className="movie-grid">
        {movies?.length > 0 ? (
          movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
              ) : (
                <p>No Image Available</p>
              )}
              <h3>{movie.title}</h3>
              <p>{movie.overview || "No description available."}</p>
              <p>
                <strong>Release Date:</strong>{" "}
                {movie.release_date || "Unknown"}
              </p>
            </div>
          ))
        ) : (
          <p>Loading movies or no results found...</p>
        )}
      </div>
    </div>
  );
};

export default MovieList;

