import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./SearchItemModal.css";

const SearchItemModal = ({ itemId, category, onClose }) => {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Capture category at mount time. If the parent's active search tab
  // changes while this modal is still open (same itemId, but that id now
  // means something different under the new category), we don't want to
  // silently refetch garbage - this modal should always describe the
  // item it was opened for.
  const [modalCategory] = useState(category);

  const fetchSearchItemDetails = async () => {
    setLoading(true);
    setError("");

    try {
      let response, data;

      switch (modalCategory) {
        case "Anime":
          response = await fetch(`https://api.jikan.moe/v4/anime/${itemId}`);
          data = await response.json();
          setItem(data.data);
          break;

        case "Movie":
          response = await fetch(`/api/tmdb?path=/movie/${itemId}`);
          data = await response.json();
          setItem(data);
          break;

        case "Series":
          response = await fetch(`/api/tmdb?path=/tv/${itemId}`);
          data = await response.json();
          setItem(data);
          break;

        case "Book":
          response = await fetch(`/api/books?path=/volumes/${itemId}`);
          data = await response.json();
          setItem(data.volumeInfo);
          break;

        default:
          throw new Error(`Unknown category: ${modalCategory}`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch item details");
    } finally {
      setLoading(false);
    }
  };

  // fetchSearchItemDetails intentionally omitted: it's redefined every
  // render, so including it would re-trigger this effect (and its own
  // setState calls) on every render, causing a fetch loop. itemId is the
  // only thing that should ever cause a refetch - modalCategory is fixed
  // for the lifetime of this modal (see comment above).
  useEffect(() => {
    fetchSearchItemDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal modal-loading">
        <div className="spinner" />
      </div>
    </div>
  );
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

  const title =
    item.title || item.name || item.title_english || item.title_original || "Untitled";
  // Strip HTML tags Google Books frequently embeds in descriptions
  // (e.g. "<p>A dark academia romantasy...</p><p></p>") - browsers don't
  // render these as tags in plain text, they'd show up literally.
  const stripHtml = (str) => str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const rawSummary =
    item.synopsis || item.description || item.overview || "No summary available.";
  const summary = stripHtml(rawSummary);

  // TMDB/Jikan use item.genres ([{name}] or [string]); Google Books uses
  // item.categories (plain strings, since volumeInfo has no "genres" field).
  const genreList = item.genres || item.categories || [];
  const genres = genreList.length
    ? genreList.map((g) => g.name || g).join(", ")
    : "N/A";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="modal-poster-container">
          <img src={image} alt={title} className="modal-poster" />
        </div>
        <div className="modal-details">
          <h2>{title}</h2>
          <p><strong>Category:</strong> {modalCategory}</p>
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

