// src/utils/safeFilter.js

export const isSafeContent = (item, type = "anime") => {
  // Rules per content type
  const rules = {
    anime: {
      bannedRatings: ["Rx", "R+"],
      bannedGenres: [9, 12, 49, 50], // hentai, ecchi, etc
    },
    movies: {
      bannedRatings: ["NC-17", "X"],
      bannedGenres: ["Adult", "Erotica"], 
    },
    series: {
      bannedRatings: ["NC-17", "X"],
      bannedGenres: ["Adult", "Erotica"],
    },
    books: {
      bannedGenres: ["Erotica", "Adult"],
    },
  };

  const r = rules[type] || {};

  // ✅ Rating filter
  const safeRating = r.bannedRatings
    ? !r.bannedRatings.some((br) => (item.rating || "").includes(br))
    : true;

  // ✅ Genre filter
  const safeGenre = r.bannedGenres
    ? !item.genres?.some(
        (g) =>
          typeof g === "string"
            ? r.bannedGenres.includes(g)
            : r.bannedGenres.includes(g.mal_id)
      )
    : true;

  return safeRating && safeGenre;
};
