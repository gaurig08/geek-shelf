// src/components/NavBar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdMenu, MdClose } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import ProfilePanel from "./ProfilePanel";
import "./NavBar.css";

const SHELF_CATEGORIES = [
  { key: "Book",   label: "📖 Books"  },
  { key: "Movie",  label: "🎬 Movies" },
  { key: "Series", label: "📺 Series" },
  { key: "Anime",  label: "⛩️ Anime"  },
];

const NavBar = () => {
  const location                      = useLocation();
  const [isOpen, setIsOpen]           = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [shelfOpen, setShelfOpen]     = useState(false);
  const menuRef                       = useRef(null);

  // Close everything when clicking outside the menu
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
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
    <nav className="nav-wrapper">
      <div className="nav-menu-area" ref={menuRef}>
        <button
          className="neu-surface neu-raised nav-icon-btn"
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
        </button>

        {isOpen && (
          <div className="neu-surface neu-raised nav-menu-panel">
            <Link to="/" className="nav-menu-link" onClick={() => setIsOpen(false)}>
              Home
            </Link>

            <div className="shelf-nav-item">
              <button className="nav-menu-link nav-menu-btn" onClick={() => setShelfOpen((o) => !o)}>
                Shelf
                <span className={`chevron ${shelfOpen ? "up" : ""}`}>▾</span>
              </button>

              {shelfOpen && (
                <div className="neu-surface neu-raised nav-submenu">
                  {SHELF_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.key}
                      to={`/shelf/${cat.key}`}
                      className="nav-submenu-item"
                      onClick={() => { setShelfOpen(false); setIsOpen(false); }}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/search" className="nav-menu-link" onClick={() => setIsOpen(false)}>
              Search
            </Link>
          </div>
        )}
      </div>

      <Link to="/" className="brand-font nav-title">GeekShelf</Link>

      <button
        className="neu-surface neu-raised nav-icon-btn"
        onClick={() => setShowProfile(true)}
        aria-label="Open profile"
      >
        <FaUserCircle size={20} />
      </button>

      <ProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </nav>
  );
};

export default NavBar;
