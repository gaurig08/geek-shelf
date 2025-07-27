// src/api/fetchSafeAnime.js
export const fetchSafeAnime = async (query) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
      const data = await response.json();
  
      // Filter out hentai, ecchi, explicit content
      const safeAnime = data.data.filter((anime) => {
        const rating = anime.rating?.toLowerCase() || "";
        return !rating.includes("hentai") && !rating.includes("r+");
      });
  
      return safeAnime;
    } catch (err) {
      console.error("Error filtering anime:", err);
      return [];
    }
  };
  