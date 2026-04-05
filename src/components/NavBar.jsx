// src/components/NavBar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdMenu, MdClose } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import ProfilePanel from "./ProfilePanel";
import "./NavBar.css";

const SHELF_CATEGORIES = [
  { key: "Book",   label: "📖 Books"  },
  { key: "Movies", label: "🎬 Movies" },
  { key: "Series", label: "📺 Series" },
  { key: "Anime",  label: "⛩️ Anime"  },
];

const NavBar = () => {
  const location                        = useLocation();
  const [isOpen, setIsOpen]             = useState(false);
  const [showProfile, setShowProfile]   = useState(false);
  const [shelfOpen, setShelfOpen]       = useState(false);
  const shelfRef                        = useRef(null);

  const isCategoryPage = /^\/shelf\/[^/]+$/.test(location.pathname);

  // Close shelf dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (shelfRef.current && !shelfRef.current.contains(e.target)) {
        setShelfOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setIsOpen(false);
    setShelfOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`nav-wrapper ${isCategoryPage ? "category-navbar" : ""}`}>

      {/* Hamburger */}
      <div className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <MdClose size={38} /> : <MdMenu size={38} />}
      </div>

      {/* Links */}
      <ul className={`nav-links ${isOpen ? "open" : ""}`}>

        <li>
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        </li>

        {/* Shelf with dropdown */}
        <li className="shelf-nav-item" ref={shelfRef}>
          <button
            className="shelf-nav-btn"
            onClick={() => setShelfOpen(!shelfOpen)}
          >
            Shelf
            <span className={`chevron ${shelfOpen ? "up" : ""}`}>▾</span>
          </button>

          {shelfOpen && (
            <div className="shelf-dropdown">
              {SHELF_CATEGORIES.map(cat => (
                <Link
                  key={cat.key}
                  to={`/shelf/${cat.key}`}
                  className="shelf-dropdown-item"
                  onClick={() => { setShelfOpen(false); setIsOpen(false); }}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}
        </li>

        <li>
          <Link to="/search" onClick={() => setIsOpen(false)}>Search</Link>
        </li>

      </ul>

      {/* Profile icon */}
      <div className="profile-icon" onClick={() => setShowProfile(true)}>
        <FaUserCircle size={42} />
      </div>

      <ProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </nav>
  );
};

export default NavBar;
