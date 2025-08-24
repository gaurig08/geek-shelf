function MovieCard({ title, poster }) {
    return (
      <div style={{ 
        border: "1px solid #ccc", 
        padding: "10px", 
        width: "200px", 
        textAlign: "center" 
      }}>
        <img 
          src={poster} 
          alt={title} 
          style={{ width: "100%", height: "300px", objectFit: "cover" }} 
        />
        <h3>{title}</h3>
      </div>
    );
  }
  
  export default MovieCard;
  
  