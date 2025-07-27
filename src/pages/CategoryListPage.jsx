import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./CategoryListPage.css";


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
    try {
      const itemDoc = doc(db, "users", user.uid, "shelf", itemId);
      await deleteDoc(itemDoc);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setNotification("Item deleted successfully!");

      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      console.error("Error deleting item:", error);
      setNotification("Failed to delete item.");
    }
  };

  return (

    <div className="category-page">
      <h2 className="category-title">📚 {category.toUpperCase()}</h2>
      {notification && <div className="notification">{notification}</div>}

      <div className="item-grid">
        {items.length === 0 ? (
          <p>No items found in this category.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="category-card">
              <Link to={`/shelf/item/${item.id}`} className="category-card-link">
                <img src={item.poster} alt={item.title} />
                <h4>{item.title}</h4>
              </Link>

              <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>

  );
};

export default CategoryListPage;

