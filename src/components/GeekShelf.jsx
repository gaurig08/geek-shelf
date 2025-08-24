import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import ItemCard from "../components/ItemCard"; // Ensure correct path

import AddItemForm from "./AddItemForm";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import getImageUrl from "../utils/getImageURL";

const addToShelf = async (item, category, refreshShelf) => {
  try {
    const formattedItem = {
      title: item.title,
      poster: getImageUrl(item, category), // Ensure correct image
      status: item.status || "Unknown",
      summary: item.summary || "No summary available.",
      watchedDate: item.watchedDate || null,
      category,
    };

    await addDoc(collection(db, "shelf"), formattedItem);
    alert(`${item.title} added to shelf!`);
    refreshShelf(); // Refresh shelf after adding
  } catch (error) {
    console.error("Error adding to shelf:", error);
  }
};

const GeekShelf = () => {
    console.log("🔥 GeekShelf Component is rendering!"); // This must appear
    const [shelf, setShelf] = useState([]);
  
    const fetchShelfData = async () => {
        console.log("Fetching data from Firestore..."); // Check if this logs
        try {
          const querySnapshot = await getDocs(collection(db, "shelf"));
          const dataList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          
          console.log("Fetched Data:", dataList); // Check if data is retrieved
          setShelf(dataList);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      <button onClick={fetchShelfData}>Test Fetch Data</button>

      
  
      useEffect(() => {
        console.log("useEffect is running!"); // Debugging: This should appear in the console
        fetchShelfData();
      }, []);
      
  
    return (
        <div>
          <h1>📚🎬 GeekShelf: Your Watch & Read List</h1>
    
          {Object.keys(shelf).map((category) => (
            <div key={category}>
              <h2>{category.toUpperCase()}</h2>
              <div className="grid">
                {shelf[category].map((item) => (
                  <ItemCard
                    key={item.id}
                    title={item.title}
                    poster={item.poster}
                    status={item.status}
                    summary={item.summary}
                    watchedDate={item.watchedDate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    };
    
    export default GeekShelf;