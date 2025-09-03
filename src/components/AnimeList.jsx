import { useState, useEffect } from "react";
import axios from "axios";

const AnimeList = () => {
  const [anime, setAnime] = useState([]);
  const [query, setQuery] = useState("One Piece"); // Default search

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const response = await axios.get(
          `https://api.jikan.moe/v4/anime?q=${query}&limit=10`
        );
        setAnime(response.data.data); // Store anime results
      } catch (error) {
        console.error("Error fetching anime:", error);
      }
    };

    fetchAnime();
  }, [query]); // Fetch data when query changes

  return (
    <div>
      <h2>Search Anime</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for anime..."
      />
      <div className="anime-grid">
        {anime.map((item) => (
          <div key={item.mal_id} className="anime-card">
            <img src={item.images.jpg.image_url} alt={item.title} />
            <h3>{item.title}</h3>
            <p><strong>Episodes:</strong> {item.episodes || "Unknown"}</p>
            <p><strong>Score:</strong> {item.score}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimeList;
