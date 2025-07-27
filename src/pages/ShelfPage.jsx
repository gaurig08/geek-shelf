import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./ShelfPage.css";


const CATEGORIES = [
  { key: "Book", label: "Books", image: "/cards/movies.png" },
  { key: "Movie", label: "Movies", image: "/cards/movies.png" },
  { key: "Series", label: "Series", image: "/cards/movies.png" },
  { key: "Anime", label: "Anime", image: "/cards/movies.png" }
];

const ShelfPage = () => {
  const navigate = useNavigate();

  const handleMouseMove = (e, card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -18;
    const rotateY = ((x - centerX) / centerX) * 18;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.08)`;
    card.style.boxShadow = `0 25px 40px rgba(255, 255, 255, 0.15), 0 8px 20px rgba(0, 0, 0, 0.25)`;
  };

  const resetTransform = (card) => {
    card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    card.style.boxShadow = "0 10px 15px rgba(0,0,0,0.1)";
  };

  return (
    <div className="shelf-container">
      {CATEGORIES.map((cat, index) => (
        <motion.div
          key={cat.key}
          className="magic-card"
          initial={{ opacity: 0, y: 150, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1.8,
            ease: [0.22, 1, 0.36, 1],
            delay: index * 0.5
          }}
          onClick={() => navigate(`/shelf/${cat.key}`)}
          onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
          onMouseLeave={(e) => resetTransform(e.currentTarget)}
        >
          <img src={cat.image} alt={cat.label} className="card-img" />
        </motion.div>
      ))}
    </div>
  );
};

export default ShelfPage;




