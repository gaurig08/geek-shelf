import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { extractItemGenres } from "./extractItemGenres";
import { getAuth } from "firebase/auth";
import { DEFAULT_STATUS } from "./shelfStatuses";

const addToShelf = async (item, category) => {
  const user = getAuth().currentUser;
  if (!user) {
    alert("Please log in to add to shelf.");
    return;
  }

  // Properly extract title, summary, and image based on item structure
  const title =
    item?.title ||
    item?.name ||
    item?.title_english ||
    item?.volumeInfo?.title ||
    "Untitled";

  const summary =
    item?.overview ||
    item?.synopsis ||
    item?.volumeInfo?.description ||
    "No description available.";

  const posterURL =
    item?.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : item?.cover_i
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`
      : item?.images?.jpg?.image_url ||
        item?.volumeInfo?.imageLinks?.thumbnail ||
        "https://via.placeholder.com/150?text=No+Image";

  // The item's ID in its source API (TMDB movie/tv id, MAL id for anime,
  // Google Books volume id). Needed to call each source's own
  // recommendations endpoint later - without this we can't ask "what did
  // TMDB/MAL recommend based on this specific title".
  const externalId = item?.id ?? item?.mal_id ?? null;

  const genres = await extractItemGenres(item, category);

  try {
    // ✅ Check if item already exists in shelf
    const shelfRef = collection(db, "users", user.uid, "shelf");
    const q = query(shelfRef, where("title", "==", title), where("category", "==", category));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("This item is already in your shelf!");
      return;
    }

    // ✅ Add new item if not duplicate
    await addDoc(shelfRef, {
      title,
      poster: posterURL,
      category,
      status: DEFAULT_STATUS,
      favorite: false,
      summary,
      genre: genres.join(", "),
      externalId,
      createdAt: serverTimestamp(),
    });

    alert("Added to shelf!");
  } catch (error) {
    console.error("Error adding to shelf:", error);
    alert("Failed to add to shelf.");
  }
};

export default addToShelf;
