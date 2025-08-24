import { useState } from "react";
import PropTypes from "prop-types";
import "./SearchBar.css";

const SearchBar = ({ onSearch, category }) => {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    if (input.trim()) {
      onSearch(input, category); // Pass the current category to fetchResults
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder={`Search here`}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
};

export default SearchBar;



