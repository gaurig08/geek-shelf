import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./CategoryListPage.css";
import { Trash2 } from "lucide-react";

const ITEMS_PER_ROW = 5;
const MIN_ROWS = 5;

const CategoryListPage = () => {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [notification, setNotification] = useState("");

  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const shelfRef = collection(db, "users", user.uid, "shelf");
        const querySnapshot = await getDocs(shelfRef);

        const formattedCategory =
          category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

        const filtered = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => item.category === formattedCategory);

        setItems(filtered);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [category, user]);

  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      const itemDoc = doc(db, "users", user.uid, "shelf", itemId);
      await deleteDoc(itemDoc);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
      window.alert("Failed to delete item.");
    }
  };

  // --- DYNAMIC ROW LOGIC ---
  const totalRows = Math.max(MIN_ROWS, Math.ceil(items.length / ITEMS_PER_ROW));
  const rows = [];
  for (let i = 0; i < totalRows; i++) {
    const rowItems = items.slice(i * ITEMS_PER_ROW, i * ITEMS_PER_ROW + ITEMS_PER_ROW);
    // Fill empty slots with null for placeholders
    while (rowItems.length < ITEMS_PER_ROW) rowItems.push(null);
    rows.push(rowItems);
  }

  return (
    <div className="category-page">
      <h2 className="category-title">{category.toUpperCase()}</h2>
      {notification && <div className="notification">{notification}</div>}

      {/* Decorative elements */}
      <div className="hp" />
      <div className="hp3" />
      <div className="e" />
      <div className="e1" />
      <div className="sleeping-cat" />
      <div className="potted-plant" />
      <div className="p1" />
      <div className="hanging-leafs" />
      <div className="lit-candle" />
      <div className="candle" />
      <div className="magical-book" />

      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="shelf-row">
          <div className="plank-bg" />
          <div className="item-grid">
            {row.map((item, idx) => (
              <div key={item?.id || idx} className="category-card">
                {item ? (
                  <>
                    <Link to={`/shelf/item/${item.id}`} className="category-card-link">
                      <h4>{item.title}</h4>
                      <div className="poster-container">
                        <img src={item.poster} alt={item.title} />
                      </div>
                    </Link>
                    <button
                      className="delete-icon"
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </>
                ) : (
                  // Blank div with same size as item
                  <div style={{ height: "307px" }}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryListPage;


