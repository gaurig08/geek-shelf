import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import getImageUrl from "../utils/getImageURL";

const AddItemForm = ({ category }) => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Planning");
  const [summary, setSummary] = useState("");
  const [poster, setPoster] = useState("");
  const [watchedDate, setWatchedDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const itemData = {
        title,
        status,
        summary,
        poster: getImageUrl({ poster_path: poster, cover_i: poster }, category),
        watchedDate,
      };

      await addDoc(collection(db, category), itemData);

      alert(`${title} added successfully!`);
      setTitle("");
      setStatus("Planning");
      setSummary("");
      setPoster("");
      setWatchedDate("");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Add {category.slice(0, -1)}</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Planning">Will Watch/Read</option>
        <option value="Watching">Currently Watching/Reading</option>
        <option value="Completed">Completed</option>
      </select>
      <textarea
        placeholder="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <input
        type="text"
        placeholder="Poster URL (optional)"
        value={poster}
        onChange={(e) => setPoster(e.target.value)}
      />
      <input
        type="date"
        value={watchedDate}
        onChange={(e) => setWatchedDate(e.target.value)}
      />
      <button type="submit">Add {category.slice(0, -1)}</button>
    </form>
  );
};

export default AddItemForm;



