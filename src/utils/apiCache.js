// src/utils/apiCache.js
//
// Minimal in-memory TTL cache for GET-style fetches. Not a replacement for
// a real cache layer, but it cuts redundant network calls within a session
// (e.g. re-opening the same search or recommendation panel) and gives a
// measurable "reduced API calls" talking point.

const store = new Map();

/**
 * Wraps a fetch-returning function with caching.
 * @param {string} key - cache key, should encode all params that affect the result
 * @param {() => Promise<any>} fetchFn - function that performs the actual fetch
 * @param {number} ttlMs - how long to keep the cached value (default 5 min)
 */
export const cachedFetch = async (key, fetchFn, ttlMs = 5 * 60 * 1000) => {
  const cached = store.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.value;
  }

  const value = await fetchFn();
  store.set(key, { value, timestamp: now });
  return value;
};

export const clearCache = () => store.clear();
