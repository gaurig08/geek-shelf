import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import "./ShelfBookTile.css";

/**
 * Shelf book tile - deliberately different from ItemCard (used in
 * Search/Recommendations, which shows title + Add/Info always visible).
 * This one shows just the cover at rest; title and delete only reveal
 * on hover, matching the approved shelf-ledge demo. The whole tile is
 * clickable to view details; the delete button stops propagation so it
 * doesn't also trigger navigation.
 */
const ShelfBookTile = ({ image, title, detailLink, onDelete }) => {
  const navigate = useNavigate();

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className="shelf-book"
      style={{ backgroundImage: `url('${image}')` }}
      onClick={() => navigate(detailLink)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") navigate(detailLink); }}
    >
      <button
        className="shelf-book-delete-btn"
        onClick={handleDeleteClick}
        title="Remove from shelf"
        aria-label="Remove from shelf"
      >
        <Trash2 size={13} />
      </button>
      <div className="shelf-book-title-overlay">{title}</div>
    </div>
  );
};

ShelfBookTile.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  detailLink: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ShelfBookTile;
