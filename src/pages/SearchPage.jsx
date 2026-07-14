// src/pages/SearchPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import SearchItemModal from "../components/SearchItemModal";
import { fetchSafeAnime } from "../utils/fetchSafeAnime";
import { isSafeContent } from "../utils/safeFilter";
import "./SearchPage.css";

const searchCache = new Map();

const SearchPage = () => {
  const [category, setCategory]           = useState("Movie");
  const [results, setResults]             = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [query, setQuery]                 = useState("");

  const debounceRef = useRef(null);
  const abortRef    = useRef(null);

  const fetchResults = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }

    const cacheKey = `${category}:${q.toLowerCase().trim()}`;
    if (searchCache.has(cacheKey)) {
      setResults(searchCache.get(cacheKey));
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    setLoading(true);
    setError("");

    try {
      let filtered = [];

      if (category === "Series") {
        const res  = await fetch(`/api/tmdb?path=/search/tv&query=${encodeURIComponent(q)}`, { signal });
        const data = await res.json();
        filtered   = (data.results || []).filter(s => isSafeContent(s, "series"));

      } else if (category === "Movie" || category === "Movies") {
        const res  = await fetch(`/api/tmdb?path=/search/movie&query=${encodeURIComponent(q)}`, { signal });
        const data = await res.json();
        filtered   = (data.results || []).filter(m => isSafeContent(m, "movie"));

      } else if (category === "Book") {
        const res  = await fetch(`/api/books?path=/volumes&q=${encodeURIComponent(q)}`, { signal });
        const data = await res.json();
        filtered   = (data.items || []).filter(b => isSafeContent(b, "book"));

      } else if (category === "Anime") {
        filtered = await fetchSafeAnime(q, signal);
      }

      searchCache.set(cacheKey, filtered);
      setResults(filtered);

    } catch (err) {
      if (err.name === "AbortError") return;
      console.error(err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [category]);

  const handleSearch = useCallback((q) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(q), 550);
  }, [fetchResults]);

  // Re-run search when category changes if there's already a query.
  // query/fetchResults intentionally omitted: this should only re-trigger
  // on category change, using whatever query is current at that moment -
  // adding them would cause a duplicate fetch on every keystroke on top
  // of the debounced handleSearch call below.
  useEffect(() => {
    setResults([]);
    setError("");
    if (query.trim()) fetchResults(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current)    abortRef.current.abort();
    };
  }, []);

  const CATEGORIES = ["Movie", "Series", "Book", "Anime"];
  const LABELS     = { Movie: "Movies", Series: "Series", Book: "Books", Anime: "Anime" };

  return (
    <div className="search-page">

      {/* Background — drop your wallpaper image path here */}
      <div className="search-bg" />

      {/* Dark overlay so text is always readable over any wallpaper */}
      <div className="search-overlay" />

      <div className="search-inner">

        {/* Category tabs */}
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`neu-surface cat-tab ${category === cat ? "neu-inset" : "neu-raised"}`}
              onClick={() => setCategory(cat)}
            >
              {LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <SearchBar onSearch={handleSearch} category={category} />

        {/* States */}
        {loading && (
          <div className="search-loading">
            <span className="spinner" />
            <span>Searching {LABELS[category]}...</span>
          </div>
        )}

        {error && <p className="search-error">{error}</p>}

        {!loading && results.length === 0 && query && !error && (
          <p className="search-empty">
            No results for <span>"{query}"</span> in {LABELS[category]}
          </p>
        )}

        {/* Results */}
        {!loading && (
          <SearchResults
            results={results}
            category={category}
            onInfoClick={(id) => { setSelectedItemId(id); setShowModal(true); }}
            type={category}
          />
        )}

      </div>

      {showModal && (
        <SearchItemModal
          itemId={selectedItemId}
          category={category}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default SearchPage;
