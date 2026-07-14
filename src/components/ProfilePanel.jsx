// src/components/ProfilePanel.jsx
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth/AuthProvider";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useTheme } from "../theme/ThemeProvider";
import Toggle from "./ui/Toggle";
import "./ProfilePanel.css";
import { getShelfCounts } from "../utils/getShelfCounts";

const STATS = [
  { key: "Book",   icon: "📚", label: "Books"  },
  { key: "Movie",  icon: "🎬", label: "Movies" },
  { key: "Series", icon: "📺", label: "Series" },
  { key: "Anime",  icon: "🌀", label: "Anime"  },
];

// Placeholder for the room-theme system - only one room exists today.
// This list becomes real once more rooms are designed; the UI already
// supports selecting between multiple, it's just not populated yet.
const ROOMS = [{ key: "default", icon: "🛏️", label: "Cozy Room" }];

const ProfilePanel = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const [emoji, setEmoji]               = useState("🦊");
  const [displayName, setDisplayName]   = useState("");
  const [editingName, setEditingName]   = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [room, setRoom] = useState("default");
  const [categoryCounts, setCategoryCounts] = useState({
    Anime: 0, Movie: 0, Series: 0, Book: 0,
  });

  const emojiOptions = ["🦊","🐉","🧙‍♀️","🌸","🌙","🐱","🦄","👻","✨","🐺"];

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.classList.add("no-scroll");
    else        document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  // Fetch profile
  useEffect(() => {
    if (!currentUser) return;
    const fetchProfile = async () => {
      const userRef  = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setEmoji(data.emoji || "🦊");
        setDisplayName(data.displayName || currentUser.displayName || currentUser.email.split("@")[0]);
        setRoom(data.room || "default");
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

  // Fetch shelf counts - refetch every time the panel opens, not just once
  // at mount, so recently-added items actually show up in the counts.
  useEffect(() => {
    if (!currentUser || !isOpen) return;
    const fetchShelfCounts = async () => {
      const counts = await getShelfCounts();
      setCategoryCounts(counts);
    };
    fetchShelfCounts();
  }, [currentUser, isOpen]);

  const handleEmojiChange = async (newEmoji) => {
    setEmoji(newEmoji);
    setShowEmojiPicker(false);
    await updateDoc(doc(db, "users", currentUser.uid), { emoji: newEmoji });
  };

  const handleNameSave = async () => {
    setEditingName(false);
    await updateDoc(doc(db, "users", currentUser.uid), { displayName });
  };

  const handleRoomChange = async (key) => {
    setRoom(key);
    await updateDoc(doc(db, "users", currentUser.uid), { room: key });
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className={`neu-surface profile-panel ${isOpen ? "open" : ""}`}>

      <button className="neu-surface neu-raised close-btn" onClick={onClose} aria-label="Close">×</button>

      {/* ── HEADER ── */}
      <div className="profile-header">
        <div className="neu-surface neu-raised profile-img">{emoji}</div>

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
          <h2 className="profile-name" onClick={() => setEditingName(true)}
            title="Click to edit">
            {displayName}
          </h2>
        )}

        <p className="profile-email">{currentUser?.email}</p>
      </div>

      <div className="panel-divider" />

      {/* ── PREFERENCES ── */}
      <div className="profile-section">
        <p className="section-label">Preferences</p>

        <div className="pref-row">
          <span>Appearance</span>
          <Toggle isDay={theme === "day"} onToggle={toggleTheme} size="sm" />
        </div>

        <div className="pref-row">
          <span>Room</span>
          <div className="room-picker">
            {ROOMS.map((r) => (
              <button
                key={r.key}
                className={`neu-surface room-thumb ${room === r.key ? "neu-inset selected" : "neu-raised"}`}
                onClick={() => handleRoomChange(r.key)}
                title={r.label}
                aria-label={r.label}
              >
                {r.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-divider" />

      {/* ── AVATAR PICKER ── */}
      <div className="profile-section">
        <button
          className="neu-surface neu-raised choose-emoji-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          {showEmojiPicker ? "Hide Avatar Picker ▲" : "Choose Avatar ▾"}
        </button>

        {showEmojiPicker && (
          <div className="emoji-picker-grid">
            {emojiOptions.map((em) => (
              <button
                key={em}
                className={`neu-surface emoji-option ${em === emoji ? "neu-inset selected" : "neu-raised"}`}
                onClick={() => handleEmojiChange(em)}
              >
                {em}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="panel-divider" />

      {/* ── SHELF STATS ── */}
      <div className="profile-section">
        <p className="section-label">Your shelf</p>
        <div className="stats-grid">
          {STATS.map(({ key, icon, label }) => (
            <div key={key} className="neu-surface stat-tile">
              <div className="stat-tile-icon">{icon}</div>
              <div className="stat-tile-count">{categoryCounts[key]}</div>
              <div className="stat-tile-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="logout-container">
        <button className="neu-surface neu-raised logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>

    </div>
  );
};

export default ProfilePanel;
