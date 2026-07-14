// src/utils/extractItemGenres.js
//
// Pulls the actual genres OFF THE ITEM ITSELF, instead of fetching the
// whole category's genre list (which was the old, buggy behavior — every
// movie was getting tagged with every possible movie genre).
//
// TMDB search results only give genre_ids (numbers), so we resolve those
// against the full genre list once and cache it in-memory for the session.
// Movie and TV genre ids are NOT the same numbering scheme in TMDB, so
// they're cached and resolved separately.
//
// Everything returned here is run through normalizeGenre so "Sci-Fi",
// "Science Fiction", and TV's "Sci-Fi & Fantasy" all collapse to one
// consistent name regardless of which API it came from.

import { normalizeGenreList } from "./normalizeGenre";

const genreCaches = { movie: null, tv: null };

const resolveTMDBGenreNames = async (genreIds = [], mediaType = "movie") => {
  if (!genreCaches[mediaType]) {
    const res = await fetch(`/api/tmdb?path=/genre/${mediaType}/list&language=en-US`);
    const data = await res.json();
    genreCaches[mediaType] = new Map((data.genres || []).map((g) => [g.id, g.name]));
  }
  return genreIds.map((id) => genreCaches[mediaType].get(id)).filter(Boolean);
};

// NOTE: category values here match SearchPage's actual CATEGORIES array
// ("Movie", "Series", "Book", "Anime" - singular), not "Movies"/"Books".
export const extractItemGenres = async (item, category) => {
  try {
    let rawGenres = [];

    if (category === "Movie" || category === "Series") {
      const mediaType = category === "Series" ? "tv" : "movie";

      if (item.genre_ids?.length) {
        rawGenres = await resolveTMDBGenreNames(item.genre_ids, mediaType);
      } else if (item.genres?.length) {
        // already-hydrated detail objects sometimes have {id,name} genre objects
        rawGenres = item.genres.map((g) => g.name).filter(Boolean);
      }
    } else if (category === "Book") {
      // Google Books' search-results list endpoint (/volumes?q=...)
      // reliably gives THINNER category data than the single-volume
      // detail endpoint (/volumes/{id}) - confirmed: the same edition of
      // Fourth Wing had just one generic category on the list endpoint,
      // but 3 specific ones (Fantasy, Romance, Dragons & Mythical
      // Creatures) on the detail endpoint. Always fetch full details for
      // Books rather than only falling back when the list gave nothing -
      // "gave something, but thin" needs the same fix as "gave nothing".
      rawGenres = item?.volumeInfo?.categories || [];
      if (item?.id) {
        try {
          const res = await fetch(`/api/books?path=/volumes/${item.id}`);
          const fullData = await res.json();
          const fullCategories = fullData?.volumeInfo?.categories || [];
          if (fullCategories.length > rawGenres.length) rawGenres = fullCategories;
        } catch (err) {
          console.warn("Full book detail fetch for genre extraction failed:", err);
        }
      }
    } else if (category === "Anime") {
      rawGenres = (item?.genres || []).map((g) => g.name).filter(Boolean);
    }

    return normalizeGenreList(rawGenres);
  } catch (err) {
    console.warn("Genre extraction failed, continuing without genre:", err);
    return [];
  }
};
