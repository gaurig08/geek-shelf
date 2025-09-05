import { useState } from "react";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import SearchItemModal from "../components/SearchItemModal";
import SpiritOrb from "../components/SpiritOrb";
import SpiritOrb1 from "../components/SpiritOrb1";
import GlowingSpiritAnimal from "../components/GlowingSpiritAnimal";
import Cat from "../components/Cat";

import { fetchSafeAnime } from "../utils/fetchSafeAnime";
import { isSafeContent } from "../utils/safeFilter"; // ✅ add this

import "./SearchPage.css";

const SearchPage = () => {
  const [category, setCategory] = useState("Movies");
  const [results, setResults] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchResults = async (query) => {
    try {
      let response, data;

      switch (category) {
        case "Series":
          response = await fetch(`/api/tmdb?path=/search/tv&query=${query}`);
          data = await response.json();
          setResults((data.results || []).filter((series) => isSafeContent(series, "series")));
          break;

        case "Movie":
        case "Movies":
          response = await fetch(`/api/tmdb?path=/search/movie&query=${query}`);
          data = await response.json();
          setResults((data.results || []).filter((movie) => isSafeContent(movie, "movie")));
          break;

        case "Book":
          response = await fetch(`/api/books?path=/volumes&q=${query}`);
          data = await response.json();
          setResults((data.items || []).filter((book) => isSafeContent(book, "book")));
          break;

        case "Anime":
          const safeAnime = await fetchSafeAnime(query);
          setResults(safeAnime);
          break;

        default:
          setResults([]);
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
    }
  };

  const handleInfoClick = (id, category) => {
    setSelectedItemId(id);
    setShowModal(true);
  };

  return (
    <>
      <div className="background-layer" />

      <div className={`search-page-wrapper ${category.toLowerCase()}-bg`}>
        <div className="spirit-animal-container">
          <div className="spirit-orb-wrapper">
            <SpiritOrb />
            <SpiritOrb1 />
          </div>
          <div className="glowing-animal-wrapper">
            <GlowingSpiritAnimal />
          </div>
          <div className="cat-wrapper">
            <Cat />
          </div>
        </div>

        <div style={{ height: "70px" }}></div>

        <div className="search-page-content">
          <div className="category-filter">
            <label>Filter by:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Movie">Movies</option>
              <option value="Series">Series</option>
              <option value="Book">Books</option>
              <option value="Anime">Anime</option>
            </select>
          </div>

          <SearchBar onSearch={fetchResults} />
          <SearchResults
            results={results}
            category={category}
            onInfoClick={handleInfoClick}
          />

          {showModal && (
            <SearchItemModal
              itemId={selectedItemId}
              category={category}
              onClose={() => setShowModal(false)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
