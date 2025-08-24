import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./ShelfItemModal.css";

const ShelfItemModal = ({ item, onClose }) => {
  const [thoughts, setThoughts] = useState("");
  const [status, setStatus] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [genre, setGenre] = useState("");

  useEffect(() => {
    if (item) {
      setThoughts(item.thoughts || "");
      setStatus(item.status || "Planning");
      setWatchedDate(item.watchedDate || "");
      setGenre(item.genre || "");
    }
  }, [item]);

  const handleSave = async () => {
    try {
      const docRef = doc(db, "shelf", item.id);
      await updateDoc(docRef, {
        thoughts,
        status,
        watchedDate,
        genre,
      });
      alert("Details updated!");
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  if (!item) return <p>Loading...</p>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="detail-container">
          <div className="detail-card">
            <img
              src={item.poster || "https://via.placeholder.com/300x450?text=No+Image"}
              alt={item.title}
              className="detail-poster"
            />
            <div className="detail-info">
              <h2>{item.title}</h2>
              <p><strong>Category:</strong> {item.category}</p>

              <label>
                <strong>Status:</strong>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Planning">Planning</option>
                  <option value="Watching">Watching</option>
                  <option value="Completed">Completed</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </label>

              <label>
                <strong>Finished / Last Watched:</strong>
                <input
                  type="date"
                  value={watchedDate}
                  onChange={(e) => setWatchedDate(e.target.value)}
                />
              </label>

              <label>
                <strong>Genre:</strong>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Enter genre(s)..."
                />
              </label>

              <p><strong>Summary:</strong> {item.summary}</p>

              <label>
                <strong>Your Thoughts:</strong>
                <textarea
                  value={thoughts}
                  onChange={(e) => setThoughts(e.target.value)}
                  placeholder="Write your thoughts here..."
                  rows={5}
                />
              </label>

              <button className="save-btn" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ShelfItemModal;

