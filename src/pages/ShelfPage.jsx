// src/pages/CategoryListPage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./ShelfPage.css";
import { Trash2 } from "lucide-react";

// ── Per-category config ───────────────────────────────────────────────────────
// Add your bg image paths here as you design them in Canva.
// background: the fixed bg image for the page
// title: display label shown at top
const CATEGORY_CONFIG = {
  Book:   { background: "/room/book-shelf.png",   title: "Books"   },
  Movies: { background: "/room/movies-shelf.png",  title: "Movies"  },
  Series: { background: "/room/series-shelf.png",  title: " "  },
  Anime:  { background: "/room/anime-shelf.png",   title: " "   },
};

// Fallback if category not in config
const DEFAULT_CONFIG = { background: "/bg/wall.webp", title: "Shelf" };

const ShelfPage = () => {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [notification, setNotification] = useState("");
  const user = getAuth().currentUser;

  // Normalise URL param → "Book", "Movies" etc.
  const formattedCategory =
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

  const config = CATEGORY_CONFIG[formattedCategory] ?? DEFAULT_CONFIG;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const shelfRef = collection(db, "users", user.uid, "shelf");
        const querySnapshot = await getDocs(shelfRef);
        const filtered = querySnapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((item) => item.category === formattedCategory);
        setItems(filtered);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [category, user]);

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "shelf", itemId));
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setNotification("Item deleted.");
      setTimeout(() => setNotification(""), 2500);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div
      className="category-page"
      style={{ backgroundImage: `url('${config.background}')` }}
    >
      <h2 className="category-title">{config.title}</h2>

      {notification && <div className="notification">{notification}</div>}

      {items.length === 0 ? (
        <div className="empty-shelf">
          <p>Nothing here yet. Search for something to add! 🕯️</p>
        </div>
      ) : (
        <div className="shelf-row-wrapper">
          <div className="shelf-row">
            {items.map((item) => (
              <div key={item.id} className="category-card">
                <button
                  className="delete-icon"
                  onClick={() => handleDelete(item.id)}
                  title="Delete"
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
                <Link to={`/shelf/item/${item.id}`} className="category-card-link">
                  <div className="poster-container">
                    <img
                      src={item.poster || "https://via.placeholder.com/300x450?text=No+Image"}
                      alt={item.title}
                    />
                  </div>
                  <h4>{item.title}</h4>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelfPage;
