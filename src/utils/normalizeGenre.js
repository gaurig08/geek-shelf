// src/utils/normalizeGenre.js
//
// TMDB, Jikan (anime), and Google Books each use their own genre naming
// conventions, and even TMDB movie vs TV genre lists don't fully agree.
// This maps genuine label synonyms - same concept, different word - to
// one canonical name (e.g. TMDB TV's "Sci-Fi & Fantasy" vs movie's
// "Science Fiction" vs Jikan's "Sci-Fi" are the same idea).
//
// IMPORTANT: this does NOT collapse distinct subgenres into a broader
// umbrella (e.g. "Romantasy" is not folded into "Fantasy", "Paranormal"
// is not folded into "Fantasy", "Superheroes" is not folded into
// "Action"). Specificity matters more than cross-category uniformity -
// genre profiles are already scoped per category (see
// recommendationEngine.buildGenreProfile), so there's no real need for
// a book's genre and a movie's genre to share a label. Merging distinct
// subgenres just throws away the exact signal that makes recommendations
// relevant - if you read romantasy, "Fantasy" alone doesn't say that.
//
// Google Books categories are also often full BISAC-style strings like
// "Juvenile Fiction / Fantasy / Epic" - we split on "/" and normalize
// each part.

// Generic BISAC qualifiers that appear on almost every book regardless
// of what it's actually about ("Fiction", "General", "Juvenile Fiction"
// as a top-level umbrella). These used to get mapped to "Fiction", which
// meant nearly every book ended up sharing that one tag - "Fiction"
// became the most common genre on any shelf by sheer frequency, drowning
// out the genres that actually distinguish one book from another. These
// are filtered out entirely instead of mapped to a fake genre.
const NOISE_TERMS = new Set([
  "fiction", "general", "nonfiction", "non-fiction",
  "juvenile fiction", "young adult fiction", "adult fiction",
  "literary", "media tie-in",
]);

/**
 * Whether a (canonicalized, title-cased) genre is too generic to be
 * useful as a SEARCH TERM, even though it's allowed to remain as weak
 * signal in a stored genre profile (see normalizeGenreList's fallback).
 * Querying an external API for "subject:Fiction" surfaces whatever's
 * most heavily indexed under that umbrella - usually public-domain
 * classics - not anything actually relevant.
 */
export const isGenericGenre = (genre) => NOISE_TERMS.has(genre.trim().toLowerCase());

// Only TRUE synonyms - same genre, different label across sources.
const CANONICAL_MAP = {
  "sci-fi": "Science Fiction",
  "scifi": "Science Fiction",
  "sci fi": "Science Fiction",
  "science fiction": "Science Fiction",
  "sci-fi & fantasy": "Science Fiction",

  "action & adventure": "Action",
  "adventure": "Adventure",
  "action": "Action",

  "war & politics": "War",
  "war": "War",

  "kids": "Family",
  "family": "Family",

  "epic": "Fantasy", // a qualifier under Fantasy, not a distinct subgenre on its own
  "fantasy": "Fantasy",

  "superhero": "Superheroes",
  "superheroes": "Superheroes",

  "graphic novels": "Comics",
  "comics & graphic novels": "Comics",

  "romance": "Romance",
  "mystery": "Mystery",
  "thriller": "Thriller",
  "horror": "Horror",
  "comedy": "Comedy",
  "drama": "Drama",
  "crime": "Crime",
  "documentary": "Documentary",
  "history": "History",
  "historical": "History",
  "music": "Music",
  "musical": "Music",
  "sports": "Sports",
  "western": "Western",
  "animation": "Animation",
  "biography": "Biography",
  "slice of life": "Slice of Life",
  "supernatural": "Supernatural",
};

/**
 * Normalizes a single genre string to its canonical form.
 * Returns null for generic noise terms (see NOISE_TERMS) so they get
 * filtered out rather than polluting the genre profile.
 * Falls back to title-casing unrecognized-but-specific genres (e.g.
 * "Romantasy", "Paranormal", "Dark Academia") rather than dropping or
 * generalizing them - specific subgenre signal is exactly what makes a
 * recommendation feel relevant instead of generic.
 */
export const normalizeGenre = (rawGenre) => {
  if (!rawGenre) return null;
  const key = rawGenre.trim().toLowerCase();

  if (NOISE_TERMS.has(key)) return null;
  if (CANONICAL_MAP[key]) return CANONICAL_MAP[key];

  return rawGenre
    .trim()
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
};

/**
 * Normalizes a list of genres, splitting Google Books' slash-delimited
 * BISAC strings first, then deduping the result.
 *
 * If every term turns out to be noise (e.g. an item whose only category
 * is literally "Fiction"), that's still better treated as weak signal
 * than as zero signal - an empty genre profile means the item can never
 * contribute to recommendations at all. So: filter noise normally, but
 * if that leaves nothing, fall back to keeping the noise term itself
 * (title-cased) rather than discarding everything.
 */
export const normalizeGenreList = (rawGenres = []) => {
  const expanded = rawGenres.flatMap((g) => g.split("/")).map((g) => g.trim()).filter(Boolean);
  const normalized = expanded.map(normalizeGenre).filter(Boolean);

  if (normalized.length > 0) return [...new Set(normalized)];
  if (expanded.length === 0) return [];

  // Every term was noise - keep it anyway as a last resort, better than
  // contributing nothing to the genre profile.
  const fallback = expanded.map((g) =>
    g.split(" ").map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(" ")
  );
  return [...new Set(fallback)];
};
