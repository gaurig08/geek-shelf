import PropTypes from "prop-types";
import { Info } from "lucide-react";
import "./ItemCard.css";

const ItemCard = ({ item, image, title, onAdd, onInfo }) => {
  return (
    <div className="item-card">
      <div className="poster-container">
        <img src={image} alt={title} className="poster" />
      </div>
      <h4 className="title">{title}</h4>
      <div className="actions">
        <button onClick={onAdd} className="glow-button">
          Add
        </button>
        <button onClick={onInfo} className="info-btn">
          <Info size={16} />
        </button>
      </div>
    </div>
  );
};

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
  onInfo: PropTypes.func.isRequired,
};

export default ItemCard;








