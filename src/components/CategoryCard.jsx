import { useRef } from "react";
import "./CategoryCard.css"; // Assuming styles are here

const CategoryCard = ({ imageSrc, onClick }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 🎯 Increase sensitivity multiplier for more tilt
    const rotateX = ((y - centerY) / centerY) * -20; // from -10 to -20
    const rotateY = ((x - centerX) / centerX) * 20;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.12)`;
  };

  const resetTransform = () => {
    const card = cardRef.current;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div
      ref={cardRef}
      className="magic-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTransform}
      onClick={onClick}
    >
      <div className="card-glow" />
      <img src={imageSrc} alt="Card" className="card-img" />
      <div className="shine" />
    </div>
  );
};

export default CategoryCard;
