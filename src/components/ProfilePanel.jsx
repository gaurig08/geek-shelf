// ProfilePanel.jsx
import { useContext, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import "./ProfilePanel.css";

const ProfilePanel = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  return (
    <div className={`profile-panel ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>×</button>
      <div className="profile-img">👤</div>
      <h2>{currentUser?.displayName || currentUser?.email?.split("@")[0]}</h2>
      <button className="logout-btn" onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default ProfilePanel;

