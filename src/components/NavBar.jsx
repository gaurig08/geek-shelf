import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // ✅ Don't forget to import useLocation
import { MdMenu, MdClose } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import ProfilePanel from "./ProfilePanel"; // ✅ Add this
import "./NavBar.css";

const NavBar = () => {
  const location = useLocation(); // ✅ Get the current location
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // ✅ State for Profile

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const isCategoryPage = /^\/shelf\/[^/]+$/.test(location.pathname);
  return (
    <nav className={`nav-wrapper ${isCategoryPage ? "category-navbar" : ""}`}>
      <div className="nav-toggle" onClick={toggleMenu}>
        {isOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
      </div>
       
      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/shelf" onClick={closeMenu}>Shelf</Link></li>
        <li><Link to="/search" onClick={closeMenu}>Search</Link></li>
      </ul>

      {/* 👤 Profile Icon */}
      <div className="profile-icon" onClick={() => setShowProfile(true)}>
        <FaUserCircle size={28} />
      </div>

      {/* 🔒 Profile Panel (Slide-in) */}
      <ProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </nav>
  );
};

export default NavBar;



