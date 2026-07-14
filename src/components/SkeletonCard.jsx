import "./SkeletonCard.css";

const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-poster" />
    <div className="skeleton-line skeleton-title" />
    <div className="skeleton-line skeleton-subtitle" />
  </div>
);

export default SkeletonCard;
