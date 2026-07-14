import { describe, it, expect, vi, beforeEach } from "vitest";
import { cachedFetch, clearCache } from "../apiCache";

describe("cachedFetch", () => {
  beforeEach(() => clearCache());

  it("only calls the fetch function once for repeated calls within TTL", async () => {
    const fetchFn = vi.fn().mockResolvedValue("result");

    await cachedFetch("key1", fetchFn, 5000);
    await cachedFetch("key1", fetchFn, 5000);

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("calls fetch again after the TTL expires", async () => {
    const fetchFn = vi.fn().mockResolvedValue("result");

    await cachedFetch("key2", fetchFn, 0); // immediately stale
    await new Promise((r) => setTimeout(r, 5));
    await cachedFetch("key2", fetchFn, 0);

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("uses separate cache entries for different keys", async () => {
    const fetchFn = vi.fn().mockResolvedValue("result");

    await cachedFetch("a", fetchFn, 5000);
    await cachedFetch("b", fetchFn, 5000);

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
