import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./SearchItemModal.css";

const SearchItemModal = ({ itemId, category, onClose }) => {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSearchItemDetails = async () => {
    setLoading(true);
    setError("");

    try {
      let response, data;

      switch (category) {
        case "Anime":
          response = await fetch(`https://api.jikan.moe/v4/anime/${itemId}`);
          data = await response.json();
          setItem(data.data);
          break;
        case "Movies":
          response = await fetch(
            `https://api.themoviedb.org/3/movie/${itemId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
          );
          data = await response.json();
          setItem(data);
          break;
        case "Series":
          response = await fetch(
            `https://api.themoviedb.org/3/tv/${itemId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
          );
          data = await response.json();
          setItem(data);
          break;
        case "Book":
          response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${itemId}?key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`
          );
          data = await response.json();
          setItem(data.volumeInfo);
          break;
        default:
          throw new Error("Unknown category.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch item details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchItemDetails();
  }, [itemId, category]);

  if (loading) return <div className="modal">Loading...</div>;
  if (error) return <div className="modal error">{error}</div>;
  if (!item) return null;

  // Poster logic
  let image = "https://placehold.co/300x450?text=No+Image";
  if (item.poster_path) {
    image = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
  } else if (item.images?.jpg?.large_image_url) {
    image = item.images.jpg.large_image_url;
  } else if (item.imageLinks?.thumbnail) {
    image = item.imageLinks.thumbnail;
  }

  const title = item.title || item.name || item.title_english || item.title_original || "Untitled";
  const summary = item.synopsis || item.description || item.overview || "No summary available.";
  const genres = item.genres?.map((g) => g.name || g).join(", ") || "N/A";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="poster-container">
        <img src={image} alt={title} className="modal-poster" />
        </div>
        <div className="modal-details">
          <h2>{title}</h2>
          <p><strong>Category:</strong> {category}</p>
          <p><strong>Genre:</strong> {genres}</p>
          <p className="summary"><strong>Summary:</strong> {summary}</p>
        </div>
      </div>
    </div>
  );
};

SearchItemModal.propTypes = {
  itemId: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SearchItemModal;


