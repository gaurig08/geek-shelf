import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./ShelfItemDetailPage.css";

const STATUSES = [
  { value: "Planning",  label: "Planning"  },
  { value: "Watching",  label: "Watching"  },
  { value: "Completed", label: "Completed" },
  { value: "Dropped",   label: "Dropped"   },
];

const ShelfItemDetailPage = () => {
  const { itemId } = useParams();
  const [item, setItem]             = useState(null);
  const [thoughts, setThoughts]     = useState("");
  const [status, setStatus]         = useState("Planning");
  const [watchedDate, setWatchedDate] = useState("");
  const [genre, setGenre]           = useState("");
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
        setThoughts(data.thoughts    || "");
        setStatus(data.status        || "Planning");
        setWatchedDate(data.watchedDate || "");
        setGenre(data.genre          || "");
      }
    };
    fetchItemDetails();
  }, [itemId, user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "shelf", itemId), {
        thoughts, status, watchedDate, genre,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  if (!item) return <p className="detail-loading">Loading...</p>;

  return (
    <div className="detail-page">
      {/* ── Background journal image ── */}
      <img
        src="/room/shelf-detail.png"
        alt=""
        className="detail-bg"
        draggable="false"
      />

      {/* ── Poster sits over the blue rectangle area ── */}
      <div className="detail-poster-zone">
        <img
          src={item.poster || "https://via.placeholder.com/300x450?text=No+Image"}
          alt={item.title}
          className="detail-poster"
        />
      </div>

      {/* ── Title ── */}
      <div className="detail-field detail-title-zone">
        <span className="detail-value detail-title-text">{item.title}</span>
      </div>

      {/* ── Category ── */}
      <div className="detail-field detail-category-zone">
        <span className="detail-value">{item.category}</span>
      </div>

      {/* ── Status stamps — 4 hotspots over the 4 black squares ── */}
      <div className="detail-status-zone">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            className={`stamp-btn ${status === s.value ? "stamp-active" : ""}`}
            onClick={() => setStatus(s.value)}
            title={s.value}
          >
            <span className="stamp-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Genre — inline editable ── */}
      <div className="detail-field detail-genre-zone">
        <input
          className="detail-inline-input"
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="e.g. Fantasy, History,..."
        />
      </div>

      {/* ── Your Thoughts ── */}
      <div className="detail-thoughts-zone">
        <textarea
          className="detail-thoughts-input"
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          placeholder="Write your thoughts here..."
        />
      </div>

      {/* ── Save button ── */}
      <button
        className={`detail-save-btn ${saved ? "detail-save-done" : ""}`}
        onClick={handleSave}
      >
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
};

export default ShelfItemDetailPage;
