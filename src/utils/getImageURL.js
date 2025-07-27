const getImageURL = (poster, cover_i, category) => {
  if (poster) return poster; // If a valid poster URL exists, return it

  if (category?.toLowerCase() === "book" && cover_i) {
      return `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`;
  }

  return "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"; // Fallback image
};

export default getImageURL;

  
  