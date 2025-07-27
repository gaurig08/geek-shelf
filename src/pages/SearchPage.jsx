import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import SearchItemModal from "../components/SearchItemModal"; // <-- create this
import "./SearchPage.css";
import { fetchSafeAnime } from "../utils/fetchSafeAnime";
import SpiritOrb from "../components/SpiritOrb";
import FloatingLotus from "../components/FloatingLotus";
import GlowingSpiritAnimal from "../components/GlowingSpiritAnimal";
import Cat from "../components/Cat";


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
          response = await fetch(
            `https://api.themoviedb.org/3/search/tv?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${query}`
          );
          data = await response.json();
          setResults(data.results);
          break;
          case "Movie":
            response = await fetch(
              `https://api.themoviedb.org/3/search/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${query}`
            );
            data = await response.json();
            setResults(data.results);
            break;
         case "Book":
          response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`
          );
          data = await response.json();
          setResults(data.items || []);
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
  
      
    <div className={`search-page-wrapper ${category.toLowerCase()}-bg`}>
      <SpiritOrb />
      <GlowingSpiritAnimal />
      <Cat />
      <FloatingLotus />
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
   
  );
};

export default SearchPage;

