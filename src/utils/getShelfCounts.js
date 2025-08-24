import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const getShelfCounts = async () => {
  const user = getAuth().currentUser;
  if (!user) return {};

  const shelfRef = collection(db, "users", user.uid, "shelf");
  const snapshot = await getDocs(shelfRef);

  const counts = { Movies: 0, Series: 0, Book: 0, Anime: 0 };

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (counts[data.category] !== undefined) {
      counts[data.category] += 1;
    }
  });

  return counts;
};
