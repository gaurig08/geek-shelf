import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Star, ArrowLeft, Heart, Check } from "lucide-react";
import { STATUSES, DEFAULT_STATUS } from "../utils/shelfStatuses";
import "./ShelfItemDetailPage.css";

const ShelfItemDetailPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem]             = useState(null);
  const [thoughts, setThoughts]     = useState("");
  const [status, setStatus]         = useState(DEFAULT_STATUS);
  const [genre, setGenre]           = useState("");
  const [rating, setRating]         = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [poppingUpTo, setPoppingUpTo] = useState(0);
  const [favorite, setFavorite]     = useState(false);
  const [saved, setSaved]           = useState(false);
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!user) return;
      const docRef  = doc(db, "users", user.uid, "shelf", itemId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setItem(data);
        setThoughts(data.thoughts || "");
        setStatus(data.status || DEFAULT_STATUS);
        setGenre(data.genre       || "");
        setRating(data.rating     || 0);
        setFavorite(data.favorite || false);
      }
    };
    fetchItemDetails();
  }, [itemId, user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "shelf", itemId), {
        thoughts, status, genre, rating, favorite,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const toggleFavorite = async () => {
    if (!user) return;
    const next = !favorite;
    setFavorite(next); // optimistic
    try {
      await updateDoc(doc(db, "users", user.uid, "shelf", itemId), { favorite: next });
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setFavorite(!next); // revert on failure
    }
  };

  if (!item) return <p className="detail-loading">Loading...</p>;

  return (
    <div className="detail-page">
      <button className="neu-surface neu-raised detail-back-arrow" onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft size={20} />
      </button>

      <div className="neu-surface detail-card">
        <div className="detail-poster-col">
          <img
            src={item.poster || "https://via.placeholder.com/300x450?text=No+Image"}
            alt={item.title}
            className="detail-poster"
          />
        </div>

        <div className="detail-info-col">
          <div className="detail-top-row">
            <span className="detail-category-badge">{item.category}</span>
            <button
              className={`neu-surface neu-raised favorite-btn ${favorite ? "favorite-active" : ""}`}
              onClick={toggleFavorite}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              title={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={20} fill={favorite ? "currentColor" : "none"} />
            </button>
          </div>
          <h1 className="detail-title">{item.title}</h1>

          <div className="detail-status-row">
            {STATUSES.map((s) => {
              const isActive = status === s.value;
              const isCompleted = isActive && s.value === "Completed";
              return (
                <button
                  key={s.value}
                  className={`neu-surface status-pill ${isActive ? "neu-inset" : "neu-raised"} ${isCompleted ? "status-pill-completed" : ""}`}
                  onClick={() => setStatus(s.value)}
                >
                  {s.label}
                  <span className="status-check-icon">
                    <Check size={13} strokeWidth={3} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="detail-rating-row">
            <span className="detail-label">Your rating</span>
            <div className="star-row" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className="star-btn"
                  onClick={() => {
                    const next = n === rating ? 0 : n;
                    setRating(next);
                    setPoppingUpTo(next);
                    setTimeout(() => setPoppingUpTo(0), 400);
                  }}
                  onMouseEnter={() => setHoverRating(n)}
                  aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star
                    size={22}
                    fill={n <= (hoverRating || rating) ? "currentColor" : "none"}
                    className={`${n <= (hoverRating || rating) ? "star-filled" : "star-empty"} ${n <= poppingUpTo ? "star-pop" : ""}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <label className="detail-label" htmlFor="genre-input">Genre</label>
          <input
            id="genre-input"
            className="neu-input detail-input"
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="e.g. Fantasy, History..."
          />

          <label className="detail-label" htmlFor="thoughts-input">Your thoughts</label>
          <textarea
            id="thoughts-input"
            className="neu-input detail-textarea"
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder="What did you think?"
          />

          <button
            className={`neu-surface neu-raised detail-save-btn ${saved ? "detail-save-done" : ""}`}
            onClick={handleSave}
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShelfItemDetailPage;
