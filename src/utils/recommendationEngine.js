// src/utils/recommendationEngine.js
//
// A small, explainable content-based recommender.
// No black-box model — just genre-overlap scoring, so it's easy to defend
// in an interview: "I rank candidates by how many genres they share with
// the user's highest-rated/most-recently-added shelf items."

/**
 * Builds a genre -> weight map from the user's shelf.
 * Status determines a base weight (Completed counts more than Planning);
 * favorite is a separate boolean flag that adds a bonus on top, since an
 * item can be a favorite at any status (e.g. "Favorite" + "Completed").
 *
 * @param {string} [category] - if given, only that category's items
 * contribute to the profile. Taste in horror movies shouldn't drive anime
 * recommendations, so each category gets its own profile.
 */
export const buildGenreProfile = (shelfItems = [], category = null) => {
  const statusWeights = { Completed: 3, "In Progress": 2, Planning: 1, Dropped: 0.5 };
  const FAVORITE_BONUS = 3;
  const profile = {};

  const scopedItems = category ? shelfItems.filter((i) => i.category === category) : shelfItems;

  for (const item of scopedItems) {
    const genreList = (item.genre || "")
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    let weight = statusWeights[item.status] ?? 1;
    if (item.favorite) weight += FAVORITE_BONUS;

    for (const genre of genreList) {
      profile[genre] = (profile[genre] || 0) + weight;
    }
  }

  return profile;
};

/**
 * Scores a single candidate item against a genre profile.
 * Returns 0 if there's no overlap at all.
 */
export const scoreCandidate = (candidateGenres = [], genreProfile = {}) => {
  return candidateGenres.reduce((sum, genre) => sum + (genreProfile[genre] || 0), 0);
};

/**
 * Ranks a pool of candidates, excluding anything already on the shelf,
 * and returns the top N with a human-readable reason attached.
 *
 * @param {string} [category] - scopes the genre profile to that category
 * (see buildGenreProfile). Should match the category the candidates came
 * from, so movies are scored against movie taste, anime against anime
 * taste, etc.
 */
export const rankRecommendations = (candidates = [], shelfItems = [], topN = 5, category = null) => {
  const genreProfile = buildGenreProfile(shelfItems, category);
  const shelfTitles = new Set(shelfItems.map((i) => i.title));

  const topGenre = Object.entries(genreProfile).sort((a, b) => b[1] - a[1])[0]?.[0];

  return candidates
    .filter((c) => !shelfTitles.has(c.title))
    .map((c) => ({
      ...c,
      _score: scoreCandidate(c.genres || [], genreProfile),
    }))
    .filter((c) => c._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, topN)
    .map((c) => ({
      ...c,
      reason: topGenre ? `Because you like ${topGenre}` : "Recommended for you",
    }));
};
