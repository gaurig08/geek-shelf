import { Link } from "react-router-dom";

const CategorySelection = () => {
  return (
    <div>
      <h1>Pick a Category</h1>
      <ul>
        <li><Link to="/movies">Movies</Link></li>
        <li><Link to="/series">TV Series</Link></li>
        <li><Link to="/anime">Anime</Link></li>
        <li><Link to="/books">Books</Link></li>
        <li><Link to="/shelf">My Shelf</Link></li>
      </ul>
    </div>
  );
};

export default CategorySelection;

