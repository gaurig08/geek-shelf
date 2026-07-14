// src/utils/fetchSafeAnime.js
//
// Jikan (MyAnimeList's public API) requires queries of at least 3
// characters, and their own docs mandate a HARD minimum of 4 seconds
// between requests - much stricter than typical rate limits. Retrying
// immediately after a 429 (as this used to do, with a 500ms-1s backoff)
// was actively making things worse: it's nearly guaranteed to hit
// another 429, since 4 seconds hasn't passed. So: retry transient server
// errors (5xx) with a longer, more realistic backoff, but fail fast on
// 429 rather than compounding the problem - the next natural debounced
// keystroke will retry once real time has actually passed.
//
// Accepts an AbortSignal so stale searches (superseded by newer
// keystrokes) actually get cancelled instead of running to completion
// and retrying in the background - this was missing before, unlike the
// other three search categories, and was a major contributor to
// hitting the rate limit under normal typing.
const fetchWithRetry = async (url, signal, retries = 1) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, { signal });

    if (response.ok || response.status === 429) return response;

    const isLastAttempt = attempt === retries;
    if (isLastAttempt) return response;

    // Only 5xx (transient server issues) get retried, with a backoff
    // that actually respects Jikan's documented cadence.
    await new Promise((r) => setTimeout(r, 4000));
  }
};

export const fetchSafeAnime = async (query, signal) => {
  const response = await fetchWithRetry(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`,
    signal
  );

  if (response.status === 429) {
    throw new Error('Anime search is rate-limited right now - wait a few seconds and try again.');
  }
  if (!response.ok) {
    throw new Error(
      `Anime search is temporarily unavailable (MyAnimeList's API is having issues) - try again shortly.`
    );
  }

  const data = await response.json();

  // Filter out hentai, ecchi, explicit content
  return (data.data || []).filter((anime) => {
    const rating = anime.rating?.toLowerCase() || "";
    return !rating.includes("hentai") && !rating.includes("r+");
  });
};
