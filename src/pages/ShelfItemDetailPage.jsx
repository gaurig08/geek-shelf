import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./ShelfItemDetailPage.css";
import { color } from "three/tsl";

const ShelfItemDetailPage = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [thoughts, setThoughts] = useState("");
  const [status, setStatus] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [genre, setGenre] = useState("");
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!user) return;

      const docRef = doc(db, "users", user.uid, "shelf", itemId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const itemData = docSnap.data();
        setItem(itemData);
        setThoughts(itemData.thoughts || "");
        setStatus(itemData.status || "Planning");
        setWatchedDate(itemData.watchedDate || "");
        setGenre(itemData.genre || "");
      } else {
        console.error("No such item found!");
      }
    };

    fetchItemDetails();
  }, [itemId, user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid, "shelf", itemId);
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

  if (!item) return <p className="detail-loading">Loading...</p>;

  return (
    <div className="detail-page">
      <div className="detail-card">
        <div className="detail-poster-container">
          <img
            src={item.poster || "https://via.placeholder.com/300x450?text=No+Image"}
            alt={item.title}
            className="detail-poster"
          />
        </div>
        <div className="detail-info">
          <h2>{item.title}</h2>
          <label><strong >Category: </strong>{item.category}</label>

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

          <label><strong>Summary:</strong> 
          <p>{item.summary}</p>
          </label>

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
  );
};

export default ShelfItemDetailPage;





