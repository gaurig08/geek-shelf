import { describe, it, expect } from "vitest";
import { normalizeGenre, normalizeGenreList, isGenericGenre } from "../normalizeGenre";

describe("normalizeGenre", () => {
  it("collapses known sci-fi synonyms to one canonical name", () => {
    expect(normalizeGenre("Sci-Fi")).toBe("Science Fiction");
    expect(normalizeGenre("Science Fiction")).toBe("Science Fiction");
    expect(normalizeGenre("Sci-Fi & Fantasy")).toBe("Science Fiction");
  });

  it("is case-insensitive", () => {
    expect(normalizeGenre("HORROR")).toBe("Horror");
    expect(normalizeGenre("horror")).toBe("Horror");
  });

  it("title-cases unknown genres instead of dropping them", () => {
    expect(normalizeGenre("cyberpunk noir")).toBe("Cyberpunk Noir");
  });

  it("returns null for empty input", () => {
    expect(normalizeGenre("")).toBeNull();
    expect(normalizeGenre(null)).toBeNull();
  });

  it("filters out generic BISAC noise terms instead of mapping them to a fake genre", () => {
    expect(normalizeGenre("Fiction")).toBeNull();
    expect(normalizeGenre("General")).toBeNull();
    expect(normalizeGenre("Juvenile Fiction")).toBeNull();
  });

  it("preserves distinct subgenres instead of collapsing them into a broader umbrella", () => {
    // These used to all get merged into "Fantasy" or "Action" - that
    // erases exactly the signal that makes a subgenre distinguishable.
    expect(normalizeGenre("Romantasy")).toBe("Romantasy");
    expect(normalizeGenre("Paranormal")).toBe("Paranormal");
    expect(normalizeGenre("Dark Academia")).toBe("Dark Academia");
  });

  it("still canonicalizes true singular/plural label variants", () => {
    expect(normalizeGenre("Superhero")).toBe("Superheroes");
    expect(normalizeGenre("Superheroes")).toBe("Superheroes");
  });
});

describe("normalizeGenreList", () => {
  it("splits Google Books' slash-delimited BISAC strings, dropping noise", () => {
    const result = normalizeGenreList(["Fiction / Fantasy / Epic"]);
    expect(result).not.toContain("Fiction");
    expect(result).toEqual(["Fantasy"]); // Fantasy + Epic (->Fantasy) dedupe to one
  });

  it("preserves a specific subgenre alongside noise-filtering", () => {
    const result = normalizeGenreList(["Fiction / Fantasy / Romantasy"]);
    expect(result).not.toContain("Fiction");
    expect(result).toContain("Fantasy");
    expect(result).toContain("Romantasy");
  });

  it("dedupes after normalization", () => {
    const result = normalizeGenreList(["Sci-Fi", "Science Fiction"]);
    expect(result).toEqual(["Science Fiction"]);
  });

  it("falls back to keeping noise terms when they're all that's available, rather than returning nothing", () => {
    // Real bug found: an item whose ONLY category is "Fiction" was
    // ending up with zero genres at all, since noise-filtering discarded
    // it and nothing else was left to take its place. Some signal (even
    // generic) beats none - an empty profile means the item can never
    // contribute to recommendations.
    expect(normalizeGenreList(["Fiction"])).toEqual(["Fiction"]);
    expect(normalizeGenreList(["General"])).toEqual(["General"]);
  });

  it("still drops noise when something more specific is also present", () => {
    const result = normalizeGenreList(["Fiction", "Fantasy"]);
    expect(result).toEqual(["Fantasy"]);
  });

  it("returns an empty array for genuinely empty input", () => {
    expect(normalizeGenreList([])).toEqual([]);
  });
});

describe("isGenericGenre", () => {
  it("identifies generic terms that should never be used as search queries", () => {
    expect(isGenericGenre("Fiction")).toBe(true);
    expect(isGenericGenre("General")).toBe(true);
  });

  it("does not flag specific genres as generic", () => {
    expect(isGenericGenre("Fantasy")).toBe(false);
    expect(isGenericGenre("Romantasy")).toBe(false);
  });
});
