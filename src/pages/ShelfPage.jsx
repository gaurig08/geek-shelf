// src/pages/ShelfPage.jsx
import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { STATUSES } from "../utils/shelfStatuses";
import RecommendationPanel from "../components/RecommendationPanel";
import ShelfBookTile from "../components/ShelfBookTile";
import Dropdown from "../components/ui/Dropdown";
import "./ShelfPage.css";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";

// ── Per-category config ───────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  Book:   { title: "Books"  },
  Movie:  { title: "Movies" },
  Series: { title: "Series" },
  Anime:  { title: "Anime"  },
};

// Fallback if category not in config
const DEFAULT_CONFIG = { title: "Shelf" };

const ShelfPage = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const sortBy = searchParams.get("sort") || "az";
  const setSortBy = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("sort", value);
      return next;
    });
  };
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [notification, setNotification] = useState("");
  const user = getAuth().currentUser;

  // Normalise URL param → "Book", "Movies" etc.
  const formattedCategory =
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

  const config = CATEGORY_CONFIG[formattedCategory] ?? DEFAULT_CONFIG;

  useEffect(() => {
    setFavoritesOnly(false);
  }, [category]);

  const fetchShelfItems = async () => {
    if (!user) return;
    try {
      const shelfRef = collection(db, "users", user.uid, "shelf");
      const q = query(shelfRef, where("category", "==", formattedCategory));
      const querySnapshot = await getDocs(q);
      const filtered = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchShelfItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, user, formattedCategory]);

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

  const visibleItems = items.filter((item) => !favoritesOnly || item.favorite === true);

  const sortedItems = [...visibleItems].sort((a, b) => {
    if (sortBy === "az") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "genre") {
      return (a.genre || "").localeCompare(b.genre || "");
    }
    // "time" - most recently added first. Items added before this field
    // existed have no createdAt - treat them as oldest, sort to the end.
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime - aTime;
  });

  // Status is now shown as separate shelf sections (like real shelves
  // grouped by "In Progress"/"Completed"/etc.) instead of a filter
  // dropdown that hides the others - the sections themselves ARE the
  // filter now, all visible at once.
  const groupedByStatus = STATUSES.reduce((acc, s) => {
    acc[s.value] = sortedItems.filter((item) => item.status === s.value);
    return acc;
  }, {});

  const hasAnyItems = sortedItems.length > 0;

  const scrollRow = (e, direction) => {
    const track = e.currentTarget.closest(".shelf-track");
    const row = track?.querySelector(".shelf-books");
    row?.scrollBy({ left: direction * 300, behavior: "smooth" });
  };

  // Ledge width can't be expressed in pure CSS as "100% of scrollable
  // content" - percentage/left-right positioning only resolves against
  // the element's own visible box, not its scrollWidth. Set it
  // explicitly so the ledge scrolls all the way under every book,
  // matching the approved demo's approach.
  const shelfRef = useRef(null);
  useEffect(() => {
    const sizeLedges = () => {
      if (!shelfRef.current) return;
      shelfRef.current.querySelectorAll(".shelf-books").forEach((row) => {
        const ledge = row.querySelector(".shelf-ledge");
        if (ledge) ledge.style.width = Math.max(row.scrollWidth, row.clientWidth) + "px";
      });
    };
    sizeLedges();
    window.addEventListener("resize", sizeLedges);
    return () => window.removeEventListener("resize", sizeLedges);
  }, [groupedByStatus]);

  return (
    <div className="category-page">
      <h2 className="category-title">{config.title}</h2>

      <div className="shelf-controls-row">
        <Dropdown
          value={sortBy}
          onChange={setSortBy}
          ariaLabel="Sort by"
          options={[
            { value: "az", label: "A – Z" },
            { value: "time", label: "Time added" },
            { value: "genre", label: "Genre" },
          ]}
        />

        <button
          className={`neu-surface neu-raised favorites-toggle ${favoritesOnly ? "neu-inset selected" : ""}`}
          onClick={() => setFavoritesOnly((f) => !f)}
          aria-label={favoritesOnly ? "Show all items" : "Show favorites only"}
          title={favoritesOnly ? "Show all items" : "Show favorites only"}
        >
          <Heart size={17} fill={favoritesOnly ? "currentColor" : "none"} />
        </button>
      </div>

      {notification && <div className="notification">{notification}</div>}

      {!hasAnyItems ? (
        <div className="empty-shelf">
          <p>
            {items.length === 0
              ? "Nothing here yet. Search for something to add! 🕯️"
              : "No favorites here yet."}
          </p>
        </div>
      ) : (
        <div ref={shelfRef} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {STATUSES.filter((s) => groupedByStatus[s.value].length > 0).map((s) => (
            <div key={s.value} className="shelf-section">
              <div className="shelf-heading">
                {s.label} <span className="shelf-count">{groupedByStatus[s.value].length}</span>
              </div>
              <div className="shelf-track">
                <button
                  className="neu-surface neu-raised scroll-arrow scroll-arrow-left"
                  onClick={(e) => scrollRow(e, -1)}
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="shelf-books">
                  <div className="shelf-ledge" />
                  {groupedByStatus[s.value].map((item) => (
                    <ShelfBookTile
                      key={item.id}
                      image={item.poster || "https://via.placeholder.com/300x450?text=No+Image"}
                      title={item.title}
                      detailLink={`/shelf/item/${item.id}`}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ))}
                </div>
                <button
                  className="neu-surface neu-raised scroll-arrow scroll-arrow-right"
                  onClick={(e) => scrollRow(e, 1)}
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="shelf-section shelf-recommendations-section">
        <RecommendationPanel category={formattedCategory} onItemAdded={fetchShelfItems} />
      </div>
    </div>
  );
};

export default ShelfPage;
