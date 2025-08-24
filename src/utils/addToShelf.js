import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { fetchGenres } from "./fetchGenreNames";
import { getAuth } from "firebase/auth";

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

  let genres = [];
  try {
    if (category === "Movies" || category === "Series") {
      genres = await fetchGenres(category, "movie");
    } else if (category === "Books") {
      genres = await fetchGenres(category, "book");
    } else if (category === "Anime") {
      genres = await fetchGenres(category, "anime");
    }
  } catch (error) {
    console.warn("Genre fetch failed, continuing without genre.");
  }

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
      status: "Planning",
      summary,
      genre: genres.join(", "),
    });

    alert("Added to shelf!");
  } catch (error) {
    console.error("Error adding to shelf:", error);
    alert("Failed to add to shelf.");
  }
};

export default addToShelf;
