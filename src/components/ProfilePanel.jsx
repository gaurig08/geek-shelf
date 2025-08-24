import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth/AuthProvider";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query } from "firebase/firestore";
import "./ProfilePanel.css";
import { getShelfCounts } from "../utils/getShelfCounts"; // import your utility

const ProfilePanel = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const [emoji, setEmoji] = useState("🦊");
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({
    Anime: 0,
    Movies: 0,
    Series: 0,
    Books: 0,
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiOptions = ["🦊", "🐉", "🧙‍♀️", "🌸", "🌙", "🐱", "🦄", "👻", "✨", "🐺"];

  useEffect(() => {
    if (isOpen) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchProfile = async () => {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setEmoji(data.emoji || "🦊");
        setDisplayName(data.displayName || currentUser.displayName || currentUser.email.split("@")[0]);
      } else {
        await setDoc(userRef, {
          displayName: currentUser.displayName || currentUser.email.split("@")[0],
          emoji: "🦊",
        });
        setEmoji("🦊");
        setDisplayName(currentUser.displayName || currentUser.email.split("@")[0]);
      }
    };
    fetchProfile();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchShelfCounts = async () => {
    const counts = await getShelfCounts();
    // Ensure all categories exist even if empty
    setCategoryCounts({
      Movies: counts.Movies || 0,
      Series: counts.Series || 0,
      Books: counts.Book || 0,
      Anime: counts.Anime || 0,
    });
  };

  fetchShelfCounts();
}, [currentUser]);

  const handleEmojiChange = async (newEmoji) => {
    setEmoji(newEmoji);
    await updateDoc(doc(db, "users", currentUser.uid), { emoji: newEmoji });
  };

  const handleNameSave = async () => {
    setEditingName(false);
    await updateDoc(doc(db, "users", currentUser.uid), { displayName });
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className={`profile-panel ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>×</button>

      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-img">{emoji}</div>

        {editingName ? (
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
            className="profile-name-input"
            autoFocus
          />
        ) : (
          <h2 className="profile-name" onClick={() => setEditingName(true)}>
            {displayName}
          </h2>
        )}

        <p className="profile-email">{currentUser?.email}</p>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="profile-content">
        <div className="emoji-picker-container">
          <button className="choose-emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            {showEmojiPicker ? "Hide Emoji Picker" : "Choose Emoji"}
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker-grid">
              {emojiOptions.map((em) => (
                <span key={em} className="emoji-option" onClick={() => handleEmojiChange(em)}>
                  {em}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="shelf-stats">
          <p>📚 Books: {categoryCounts.Books}</p>
          <p>🎬 Movies: {categoryCounts.Movies}</p>
          <p>📺 Series: {categoryCounts.Series}</p>
          <p>🌀 Anime: {categoryCounts.Anime}</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
};

export default ProfilePanel;







