import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getRecommendations } from "../utils/getRecommendations";
import addToShelf from "../utils/addToShelf";
import ItemCard from "./ItemCard";
import SearchItemModal from "./SearchItemModal";
import SkeletonCard from "./SkeletonCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./RecommendationPanel.css";

const CATEGORY_LABELS = { Movie: "Movies", Series: "Series", Anime: "Anime", Book: "Books" };
const ALL_CATEGORIES = ["Movie", "Series", "Anime", "Book"];

/**
 * @param {string} [category] - if given, only fetches/shows that one
 * category's recommendations (e.g. on a Movies shelf page, just show
 * movie recs). Omit to show a section per category with results.
 */
const RecommendationPanel = ({ category = null, onItemAdded = null }) => {
  const CATEGORIES = category ? [category] : ALL_CATEGORIES;
  const [status, setStatus] = useState("loading"); // loading | ready | empty | error
  const [sections, setSections] = useState({}); // { Movie: [...], ... }
  const [selectedItem, setSelectedItem] = useState(null); // { id, category }
  const [showModal, setShowModal] = useState(false);
  const user = getAuth().currentUser;

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setStatus("empty");
        return;
      }
      try {
        const shelfSnap = await getDocs(collection(db, "users", user.uid, "shelf"));
        const shelfItems = shelfSnap.docs.map((d) => d.data());

        if (shelfItems.length === 0) {
          setStatus("empty");
          return;
        }

        const results = await Promise.allSettled(
          CATEGORIES.map(async (cat) => {
            const ranked = await getRecommendations(shelfItems, cat, 8);
            return [cat, ranked];
          })
        );

        const nextSections = {};
        for (const result of results) {
          if (result.status === "fulfilled") {
            const [cat, ranked] = result.value;
            if (ranked.length > 0) nextSections[cat] = ranked;
          }
        }

        setSections(nextSections);
        setStatus(Object.keys(nextSections).length > 0 ? "ready" : "empty");
      } catch (err) {
        console.error("Recommendation fetch failed:", err);
        setStatus("error");
      }
    };
    run();
    // CATEGORIES is derived fresh from `category` every render (new array
    // reference each time) - depending on it directly would refetch on
    // every render. `category`, the actual primitive it's derived from,
    // is already in the deps below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, category]);

  const handleAdd = async (candidate) => {
    if (!user?.uid) {
      alert("You must be logged in to add to shelf.");
      return;
    }
    await addToShelf(candidate.raw, candidate.category);
    if (onItemAdded) onItemAdded();
  };

  const handleInfo = (candidate) => {
    setSelectedItem({ id: String(candidate.id), category: candidate.category });
    setShowModal(true);
  };

  const scrollRow = (e, direction) => {
    const section = e.currentTarget.closest(".recommendation-section");
    const row = section?.querySelector(".recommendation-row");
    row?.scrollBy({ left: direction * 260, behavior: "smooth" });
  };

  if (status === "error") return null; // fail quietly, don't break the page

  return (
    <section className="recommendation-panel">
      <h3 className="recommendation-heading">Picked for you</h3>

      {status === "loading" && (
        <div className="recommendation-row">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {status === "empty" && (
        <p className="recommendation-empty">
          Add a few things to your shelf and we'll start suggesting more. 📚
        </p>
      )}

      {status === "ready" &&
        CATEGORIES.filter((cat) => sections[cat]?.length).map((cat) => (
          <div key={cat} className="recommendation-section">
            {!category && <h4 className="recommendation-subheading">{CATEGORY_LABELS[cat]}</h4>}
            <button
              className="neu-surface neu-raised scroll-arrow scroll-arrow-left"
              onClick={(e) => scrollRow(e, -1)}
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="recommendation-row">
              {sections[cat].map((item) => (
                <ItemCard
                  key={item.title}
                  image={item.poster || "https://via.placeholder.com/300x450?text=No+Image"}
                  title={item.title}
                  onAdd={() => handleAdd(item)}
                  onInfo={() => handleInfo(item)}
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
        ))}

      {showModal && selectedItem && (
        <SearchItemModal
          itemId={selectedItem.id}
          category={selectedItem.category}
          onClose={() => setShowModal(false)}
        />
      )}
    </section>
  );
};

export default RecommendationPanel;
