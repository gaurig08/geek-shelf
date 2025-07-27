import PropTypes from "prop-types";
import ItemCard from "./ItemCard";
import addToShelf from "../utils/addToShelf";
import { getAuth } from "firebase/auth";
import "./SearchResults.css";


const SearchResults = ({ results, category, onInfoClick, type }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <div className="search-results">
      {results.length === 0 ? (
        <p className="no-results">No results found.</p>
      ) : (
        <>
          <h3 className="results-heading">Results for {category}</h3>
          <div className="results-grid">
            {results.map((item) => {
              const id =
                item.id ||
                item.mal_id ||
                item.key?.split("/").pop() ||
                item.cover_edition_key;
              const title =
                item.title ||
                item.name ||
                item.title_english ||
                item.volumeInfo?.title ||
                "Untitled";

              let image = "https://placehold.co/300x450?text=No+Image";
              if (item.poster_path) {
                image = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
              } else if (item.image_url) {
                image = item.image_url;
              } else if (item.volumeInfo?.imageLinks?.thumbnail) {
                image = item.volumeInfo.imageLinks.thumbnail;
              } else if (item.cover_i) {
                image = `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`;
              } else if (item.images?.jpg?.image_url) {
                image = item.images.jpg.image_url;
              } else if (item.covers?.[0]) {
                image = `https://covers.openlibrary.org/b/id/${item.covers[0]}-L.jpg`;
              }

              return (
                <ItemCard
                  key={id}
                  item={item}
                  image={image}
                  title={title}
                  onAdd={() =>
                    user?.uid
                      ? addToShelf(item, category, type, user.uid)
                      : alert("You must be logged in to add to shelf.")
                  }
                  onInfo={() => onInfoClick(id, category)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

SearchResults.propTypes = {
  results: PropTypes.array.isRequired,
  category: PropTypes.string.isRequired,
  onInfoClick: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

export default SearchResults;





