import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../authContext"; // assuming you have an auth hook

const handleDelete = async (itemId) => {
  const { currentUser } = useAuth(); // get current user

  if (!currentUser) {
    console.error("No user logged in");
    return;
  }

  try {
    const confirm = window.confirm("Are you sure you want to delete this item?");
    if (!confirm) return;

    // Reference to the user's specific shelf item
    const itemDoc = doc(db, "users", currentUser.uid, "shelf", itemId);
    await deleteDoc(itemDoc);

    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

    alert("Item deleted!");
  } catch (error) {
    console.error("Error deleting item:", error);
    alert("Failed to delete item.");
  }
};
