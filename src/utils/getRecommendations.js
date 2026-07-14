// src/utils/getRecommendations.js
//
// Movies/Series/Anime: borrows each source's own "recommended based on
// this title" endpoint (TMDB /movie/{id}/recommendations,
// /tv/{id}/recommendations, Jikan /anime/{id}/recommendations) instead
// of matching by genre ID. This is real cross-user signal computed by
// platforms with actual user bases to draw on - something we can't
// honestly replicate ourselves with no cross-user data of our own.
//
// We call it once per each of the user's top-weighted shelf items
// (favorite/completed first) in that category, then rank candidates by
// how many of those source items recommended them - a title that comes
// up across 3 of your favorites is a stronger signal than one that only
// came up once, similar in spirit to "people who liked what you liked
// also liked this."
//
// Falls back to genre-based discovery if no shelf items in that category
// have a stored externalId yet (added before this field existed) or the
// ID-based lookup comes up empty.
//
// Books: Google Books has no equivalent recommendation endpoint, so this
// stays genre-based - blending the user's top 2 genres for that category.

import { cachedFetch } from "./apiCache";
import { buildGenreProfile, rankRecommendations } from "./recommendationEngine";
import { normalizeGenreList, isGenericGenre } from "./normalizeGenre";
import { getAIBookRecommendations } from "./getBookRecommendationsAI";

const STATUS_WEIGHTS = { Completed: 3, "In Progress": 2, Planning: 1, Dropped: 0.5 };
const FAVORITE_BONUS = 3;

const itemWeight = (item) => (STATUS_WEIGHTS[item.status] ?? 1) + (item.favorite ? FAVORITE_BONUS : 0);

const topWeightedWithId = (shelfItems, category, n = 4) =>
  shelfItems
    .filter((i) => i.category === category && i.externalId)
    .sort((a, b) => itemWeight(b) - itemWeight(a))
    .slice(0, n);

/**
 * Calls fetchOne(sourceItem) for each of the top-weighted source items,
 * then aggregates the resulting candidate lists by how many sources
 * recommended each title (frequency), using popularity/votes as a
 * tiebreaker between equally-frequent candidates.
 */
export const aggregateByFrequency = async (sourceItems, fetchOne) => {
  const resultsPerSource = await Promise.all(sourceItems.map(fetchOne));
  const counts = new Map();

  for (const results of resultsPerSource) {
    const seenThisSource = new Set();
    for (const candidate of results) {
      if (!candidate.title || seenThisSource.has(candidate.title)) continue;
      seenThisSource.add(candidate.title);
      const existing = counts.get(candidate.title);
      if (existing) {
        existing.count += 1;
        existing.popularity = Math.max(existing.popularity, candidate.popularity || 0);
      } else {
        counts.set(candidate.title, { ...candidate, count: 1 });
      }
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count || b.popularity - a.popularity);
};

const fetchMovieRecsFor = (sourceItem) =>
  cachedFetch(`movierec:${sourceItem.externalId}`, async () => {
    try {
      const res = await fetch(`/api/tmdb?path=/movie/${sourceItem.externalId}/recommendations`);
      if (!res.ok) {
        console.warn(`Movie recommendations fetch failed for ${sourceItem.title} (status ${res.status})`);
        return [];
      }
      const data = await res.json();
      return (data.results || []).map((m) => ({
        id: m.id,
        title: m.title,
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        popularity: m.popularity || 0,
        category: "Movie",
        raw: m,
      }));
    } catch (err) {
      console.warn(`Movie recommendations fetch errored for ${sourceItem.title}:`, err.message);
      return [];
    }
  });

const fetchSeriesRecsFor = (sourceItem) =>
  cachedFetch(`seriesrec:${sourceItem.externalId}`, async () => {
    try {
      const res = await fetch(`/api/tmdb?path=/tv/${sourceItem.externalId}/recommendations`);
      if (!res.ok) {
        console.warn(`Series recommendations fetch failed for ${sourceItem.title} (status ${res.status})`);
        return [];
      }
      const data = await res.json();
      return (data.results || []).map((s) => ({
        id: s.id,
        title: s.name,
        poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
        popularity: s.popularity || 0,
        category: "Series",
        raw: s,
      }));
    } catch (err) {
      console.warn(`Series recommendations fetch errored for ${sourceItem.title}:`, err.message);
      return [];
    }
  });

const fetchAnimeRecsFor = (sourceItem) =>
  cachedFetch(`animerec:${sourceItem.externalId}`, async () => {
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${sourceItem.externalId}/recommendations`);
      if (!res.ok) return [];
      const data = await res.json();
      // Jikan's shape is {data: [{entry: {mal_id, title, images...}, votes}]} -
      // user-submitted recommendation pairs from MyAnimeList, votes = how
      // many MAL users agreed with that pairing.
      return (data.data || []).map((r) => ({
        id: r.entry?.mal_id,
        title: r.entry?.title,
        poster: r.entry?.images?.jpg?.image_url || null,
        popularity: r.votes || 0,
        category: "Anime",
        raw: r.entry,
      }));
    } catch (err) {
      console.warn("Anime ID-based recommendation fetch failed:", err);
      return [];
    }
  });

const ID_BASED_FETCHERS = { Movie: fetchMovieRecsFor, Series: fetchSeriesRecsFor, Anime: fetchAnimeRecsFor };

// ── Genre-based fallback (used for Books always, and for Movie/Series/
// Anime when no shelf items in that category have a stored externalId
// yet, or the ID-based lookup returns nothing) ──

const TMDB_MOVIE_GENRE_IDS = {
  Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80,
  Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36,
  Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749,
  "Science Fiction": 878, "TV Movie": 10770, Thriller: 53, War: 10752, Western: 37,
};
const TMDB_TV_GENRE_IDS = {
  Action: 10759, Animation: 16, Comedy: 35, Crime: 80, Documentary: 99,
  Drama: 18, Family: 10751, Mystery: 9648, "Science Fiction": 10765,
  War: 10768, Western: 37,
};
const JIKAN_GENRE_IDS = {
  Action: 1, Adventure: 2, Comedy: 4, Drama: 8, Fantasy: 10, Horror: 14,
  Mystery: 7, Romance: 22, "Science Fiction": 24, "Slice of Life": 36,
  Sports: 30, Supernatural: 37, Thriller: 41,
};

const topGenresFor = (shelfItems, category, n = 2) => {
  const profile = buildGenreProfile(shelfItems, category);
  const ranked = Object.entries(profile).sort((a, b) => b[1] - a[1]).map(([g]) => g);

  // Prefer specific genres as the actual search terms - "Fiction" might
  // be the single highest-weighted entry (if it's all several items
  // have), but querying an external API for something that generic
  // returns whatever's most heavily indexed there, not anything
  // relevant. Only fall back to generic terms if there's truly nothing
  // more specific to search with.
  const specific = ranked.filter((g) => !isGenericGenre(g));
  const usable = specific.length > 0 ? specific : ranked;

  return usable.slice(0, n);
};

const fetchMovieCandidatesByGenre = async (shelfItems) => {
  const genreIds = topGenresFor(shelfItems, "Movie").map((g) => TMDB_MOVIE_GENRE_IDS[g]).filter(Boolean);
  if (genreIds.length === 0) return [];
  const genreParam = genreIds.join("|");
  return cachedFetch(`recs:movie:${genreParam}`, async () => {
    const res = await fetch(`/api/tmdb?path=/discover/movie&with_genres=${genreParam}&sort_by=popularity.desc`);
    const data = await res.json();
    return (data.results || []).map((m) => ({
      id: m.id,
      title: m.title,
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      genres: normalizeGenreList((m.genre_ids || []).map((id) =>
        Object.keys(TMDB_MOVIE_GENRE_IDS).find((n) => TMDB_MOVIE_GENRE_IDS[n] === id)).filter(Boolean)),
      category: "Movie",
      raw: m,
    }));
  });
};

const fetchSeriesCandidatesByGenre = async (shelfItems) => {
  const genreIds = topGenresFor(shelfItems, "Series").map((g) => TMDB_TV_GENRE_IDS[g]).filter(Boolean);
  if (genreIds.length === 0) return [];
  const genreParam = genreIds.join("|");
  return cachedFetch(`recs:tv:${genreParam}`, async () => {
    const res = await fetch(`/api/tmdb?path=/discover/tv&with_genres=${genreParam}&sort_by=popularity.desc`);
    const data = await res.json();
    return (data.results || []).map((s) => ({
      id: s.id,
      title: s.name,
      poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
      genres: normalizeGenreList((s.genre_ids || []).map((id) =>
        Object.keys(TMDB_TV_GENRE_IDS).find((n) => TMDB_TV_GENRE_IDS[n] === id)).filter(Boolean)),
      category: "Series",
      raw: s,
    }));
  });
};

const fetchAnimeCandidatesByGenre = async (shelfItems) => {
  const topGenres = topGenresFor(shelfItems, "Anime");
  const genreIds = topGenres.map((g) => JIKAN_GENRE_IDS[g]).filter(Boolean);
  if (genreIds.length === 0) return [];

  // Jikan's docs on combining multiple genre ids are ambiguous about
  // whether it's AND or OR - one of their own example snippets describes
  // combining ids as genre "X and Y" (suggesting AND, which would make
  // blending genres too narrow). Safer to query each genre separately
  // and merge results ourselves, same as the Books fix.
  const resultsPerGenre = await Promise.all(
    genreIds.map((genreId) =>
      cachedFetch(`recs:anime:${genreId}`, async () => {
        try {
          const res = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=popularity&sort=asc&limit=20`);
          if (!res.ok) return [];
          const data = await res.json();
          return (data.data || []).map((a) => ({
            id: a.mal_id,
            title: a.title,
            poster: a.images?.jpg?.image_url || null,
            genres: normalizeGenreList((a.genres || []).map((g) => g.name)),
            category: "Anime",
            raw: a,
          }));
        } catch (err) {
          console.warn(`Anime genre-based recommendation fetch failed for genre id ${genreId}:`, err.message);
          return [];
        }
      })
    )
  );

  const seen = new Map();
  for (const results of resultsPerGenre) {
    for (const anime of results) {
      if (!seen.has(anime.id)) seen.set(anime.id, anime);
    }
  }
  return [...seen.values()];
};

const fetchBookCandidatesByGenre = async (shelfItems) => {
  // Top 3 genres instead of 2 for Books specifically - preserving
  // specific subgenres (Romantasy, Dragons & Mythical Creatures, etc.)
  // means weight is spread across more distinct, narrower terms than a
  // simpler broad-bucket system would produce, so a wider net helps here.
  const topGenres = topGenresFor(shelfItems, "Book", 3);
  if (topGenres.length === 0) {
    console.warn("No usable genres found on any Book shelf items - can't generate book recommendations.");
    return [];
  }

  // Google Books' q parameter does NOT support an OR operator (their docs
  // only document implicit AND via space-separated terms) - combining
  // "subject:X OR subject:Y" in one request was silently returning
  // irrelevant/empty results, since "OR" was just being treated as a
  // literal search word rather than a real operator. Instead, we make
  // one clean, well-documented call per genre and merge results
  // ourselves, deduping by volume id.
  const resultsPerGenre = await Promise.all(
    topGenres.map((genre) =>
      cachedFetch(`recs:book:${genre}`, async () => {
        try {
          const res = await fetch(`/api/books?path=/volumes&q=${encodeURIComponent(`subject:${genre}`)}&orderBy=relevance&maxResults=40`);
          if (!res.ok) {
            console.warn(`Book recommendations fetch failed (status ${res.status}) for genre: ${genre}`);
            return [];
          }
          const data = await res.json();
          return (data.items || []).map((b) => ({
            id: b.id,
            title: b.volumeInfo?.title,
            poster: b.volumeInfo?.imageLinks?.thumbnail || null,
            genres: normalizeGenreList(b.volumeInfo?.categories || []),
            category: "Book",
            raw: b,
          })).filter((b) => b.title);
        } catch (err) {
          console.warn(`Book recommendations fetch errored for genre ${genre}:`, err.message);
          return [];
        }
      })
    )
  );

  // Track how many of the searched genres each book matched, instead of
  // just deduping to "first seen" - Google's subject: search already
  // found these because they're relevant to that genre, a book matching
  // multiple of the user's top genres is a stronger signal than one
  // matching only one, similar in spirit to the ID-based frequency
  // ranking used for Movies/Series/Anime.
  const seen = new Map();
  for (const results of resultsPerGenre) {
    for (const book of results) {
      const existing = seen.get(book.id);
      if (existing) {
        existing.matchCount += 1;
      } else {
        seen.set(book.id, { ...book, matchCount: 1 });
      }
    }
  }
  return [...seen.values()].sort((a, b) => b.matchCount - a.matchCount);
};

const GENRE_BASED_FETCHERS = {
  Movie: fetchMovieCandidatesByGenre,
  Series: fetchSeriesCandidatesByGenre,
  Anime: fetchAnimeCandidatesByGenre,
  Book: fetchBookCandidatesByGenre,
};

/**
 * Top-level entry point: gets ranked recommendation candidates for one
 * category, each with `raw` (the original source item, for adding to
 * shelf) and `id` (for opening the info modal) attached.
 */
export const getRecommendations = async (shelfItems = [], category = "Movie", topN = 6) => {
  const shelfTitles = new Set(shelfItems.map((i) => i.title));

  if (category !== "Book") {
    const sourceItems = topWeightedWithId(shelfItems, category);
    if (sourceItems.length > 0) {
      const ranked = await aggregateByFrequency(sourceItems, ID_BASED_FETCHERS[category]);
      const filtered = ranked.filter((c) => c.title && !shelfTitles.has(c.title)).slice(0, topN);
      if (filtered.length > 0) return filtered;
      // ID-based lookup came up empty (e.g. an obscure title with no
      // recommendations on the source platform) - fall through to genre.
    }

    const candidates = await GENRE_BASED_FETCHERS[category](shelfItems);
    return rankRecommendations(candidates, shelfItems, topN, category);
  }

  // Books: try AI-based recommendations first - an LLM actually
  // understands what "Fourth Wing + Academy of Villains" means (romantasy,
  // dragons, dark academia) rather than fighting inconsistent BISAC
  // subject-string matching. Falls back to genre-based subject search if
  // Gemini is unavailable/quota-exhausted or returns nothing verifiable.
  const aiRecommendations = await getAIBookRecommendations(shelfItems, topN);
  if (aiRecommendations.length > 0) return aiRecommendations;

  // Fallback: trust Google's own subject-search relevance matching rather
  // than re-filtering through exact-string genre overlap scoring. BISAC
  // category text varies in phrasing (e.g. "Fantasy & Magic" vs
  // "Fantasy") in a way TMDB/Jikan's fixed numeric genre IDs don't, so
  // the strict scorer was discarding books Google had already correctly
  // matched, just because our own re-normalization didn't produce an
  // identical string. fetchBookCandidatesByGenre already ranks by how
  // many of the searched genres each book matched.
  const candidates = await fetchBookCandidatesByGenre(shelfItems);
  return candidates.filter((c) => c.title && !shelfTitles.has(c.title)).slice(0, topN);
};
