// src/utils/safeFilter.js
export const isSafeContent = (item, type) => {
  if (!item) return false;

  // --------- ANIME ----------
  if (type === "anime") {
    const bannedRatings = ["rx", "r+"]; // hentai/ecchi
    const bannedGenres = [9, 12, 49, 50]; // Hentai, Ecchi, Erotica, Adult Cast

    const rating = (item.rating || "").toLowerCase();
    if (bannedRatings.some(r => rating.includes(r))) return false;

    if (item.genres && item.genres.some(g => bannedGenres.includes(g.mal_id))) {
      return false;
    }

    return true;
  }

  // --------- MOVIES & SERIES ----------
  if (type === "movie" || type === "series") {
    const blockedWords = ["porn", "adult", "sex", "hentai", "x-rated", "xxx", "nsfw", "erotica"];
    const title = (item.title || item.name || "").toLowerCase();

    if (blockedWords.some(word => title.includes(word))) {
      return false;
    }

    return true;
  }

  // --------- BOOKS ----------
  if (type === "book") {
    const blockedWords = ["erotica", "porn", "sex", "xxx"];
    const title = (item.title || "").toLowerCase();

    if (blockedWords.some(word => title.includes(word))) {
      return false;
    }

    return true;
  }

  return true;
};
