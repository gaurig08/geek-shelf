// src/components/SearchBar.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import "./SearchBar.css";

const SearchBar = ({ onSearch, category }) => {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    if (input.trim()) onSearch(input, category);
  };

  return (
    <div className="search-bar">
      <div className="search-bar-inner neu-input">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          id="search-query"
          name="query"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onSearch(e.target.value, category); // live debounced search
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={`Search ${category === "Movie" ? "Movies" : category === "Book" ? "Books" : category}...`}
          autoComplete="off"
          spellCheck="false"
        />
        {input && (
          <button
            className="clear-btn"
            onClick={() => { setInput(""); onSearch("", category); }}
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </div>
      <button className="neu-surface neu-raised search-btn" onClick={handleSearch}>
        Search
      </button>
    </div>
  );
};

SearchBar.propTypes = {
  onSearch:  PropTypes.func.isRequired,
  category:  PropTypes.string.isRequired,
};

export default SearchBar;
