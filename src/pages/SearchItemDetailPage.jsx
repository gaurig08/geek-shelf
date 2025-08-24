import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./SearchItemDetailPage.css";

const SearchItemDetailPage = () => {
  const { category, itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSearchItemDetails = async () => {
    try {
      setLoading(true);
      let url = "";

      const categoryLower = category?.toLowerCase();

      if (categoryLower === "movie") {
        url = `https://api.themoviedb.org/3/movie/${itemId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`;
      } else if (categoryLower === "series") {
        url = `https://api.themoviedb.org/3/tv/${itemId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`;
      } else if (categoryLower === "anime") {
        url = `https://api.jikan.moe/v4/anime/${itemId}`;
      } else if (categoryLower === "book") {
        url = `https://www.googleapis.com/books/v1/volumes/${itemId}?key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`;
      } else {
        throw new Error("Unknown category.");
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch item details");
      const data = await response.json();

      setItem(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchItemDetails();
  }, [itemId, category]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!item) return <div>No item data available.</div>;

  const renderDetails = () => {
    switch (category.toLowerCase()) {
      case "movie":
      case "series":
        return (
          <>
            <h2>{item.title || item.name}</h2>
            <img
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              alt={item.title || item.name}
              className="detail-poster"
            />
            <p>{item.overview}</p>
            <p><strong>Release Date:</strong> {item.release_date || item.first_air_date}</p>
          </>
        );

      case "anime":
        return (
          <>
            <h2>{item.data.title}</h2>
            <img
              src={item.data.images.jpg.large_image_url}
              alt={item.data.title}
              className="detail-poster"
            />
            <p>{item.data.synopsis}</p>
            <p><strong>Episodes:</strong> {item.data.episodes}</p>
            <p><strong>Status:</strong> {item.data.status}</p>
          </>
        );

      case "book":
        return (
          <>
            <h2>{item.volumeInfo.title}</h2>
            {item.volumeInfo.imageLinks?.thumbnail && (
              <img
                src={item.volumeInfo.imageLinks.thumbnail}
                alt={item.volumeInfo.title}
                className="detail-poster"
              />
            )}
            <p><strong>Description:</strong> {item.volumeInfo.description || "N/A"}</p>
            <p><strong>Authors:</strong> {item.volumeInfo.authors?.join(", ") || "Unknown"}</p>
            <p><strong>Published:</strong> {item.volumeInfo.publishedDate || "N/A"}</p>
          </>
        );

      default:
        return <p>Unsupported category.</p>;
    }
  };

  return (
    <div className="search-detail-page">
      {renderDetails()}
    </div>
  );
};

export default SearchItemDetailPage;














