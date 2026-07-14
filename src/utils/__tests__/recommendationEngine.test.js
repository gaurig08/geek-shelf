import { describe, it, expect } from "vitest";
import { buildGenreProfile, scoreCandidate, rankRecommendations } from "../recommendationEngine";

describe("buildGenreProfile", () => {
  it("weights completed items higher than planning", () => {
    const shelf = [
      { genre: "Action, Thriller", status: "Completed" },
      { genre: "Comedy", status: "Planning" },
    ];
    const profile = buildGenreProfile(shelf);
    expect(profile.Action).toBe(3);
    expect(profile.Thriller).toBe(3);
    expect(profile.Comedy).toBe(1);
  });

  it("weights in-progress items between completed and planning", () => {
    const shelf = [{ genre: "Horror", status: "In Progress" }];
    expect(buildGenreProfile(shelf).Horror).toBe(2);
  });

  it("adds a bonus for favorited items on top of their status weight", () => {
    const shelf = [{ genre: "Romance", status: "Planning", favorite: true }];
    // Planning (1) + favorite bonus (3) = 4
    expect(buildGenreProfile(shelf).Romance).toBe(4);
  });

  it("favorite bonus stacks with a higher status weight", () => {
    const shelf = [{ genre: "Drama", status: "Completed", favorite: true }];
    // Completed (3) + favorite bonus (3) = 6
    expect(buildGenreProfile(shelf).Drama).toBe(6);
  });

  it("scopes the profile to one category when given", () => {
    const shelf = [
      { genre: "Horror", status: "Completed", category: "Movie" },
      { genre: "Slice of Life", status: "Completed", category: "Anime" },
    ];
    const movieProfile = buildGenreProfile(shelf, "Movie");
    expect(movieProfile.Horror).toBe(3);
    expect(movieProfile["Slice of Life"]).toBeUndefined();

    const animeProfile = buildGenreProfile(shelf, "Anime");
    expect(animeProfile["Slice of Life"]).toBe(3);
    expect(animeProfile.Horror).toBeUndefined();
  });

  it("returns an empty profile for an empty shelf", () => {
    expect(buildGenreProfile([])).toEqual({});
  });

  it("handles items with no genre string", () => {
    const shelf = [{ status: "Completed" }];
    expect(buildGenreProfile(shelf)).toEqual({});
  });
});

describe("scoreCandidate", () => {
  it("sums weights for overlapping genres", () => {
    const profile = { Action: 3, Comedy: 1 };
    expect(scoreCandidate(["Action", "Comedy"], profile)).toBe(4);
  });

  it("returns 0 when there is no overlap", () => {
    const profile = { Action: 3 };
    expect(scoreCandidate(["Romance"], profile)).toBe(0);
  });
});

describe("rankRecommendations", () => {
  const shelf = [{ title: "Old Movie", genre: "Action", status: "Completed" }];

  it("excludes items already on the shelf", () => {
    const candidates = [{ title: "Old Movie", genres: ["Action"] }];
    expect(rankRecommendations(candidates, shelf)).toHaveLength(0);
  });

  it("ranks higher-overlap candidates first", () => {
    const candidates = [
      { title: "Low Match", genres: ["Comedy"] },
      { title: "High Match", genres: ["Action"] },
    ];
    const shelfWithComedy = [
      ...shelf,
      { title: "Filler", genre: "Comedy", status: "Planning" },
    ];
    const result = rankRecommendations(candidates, shelfWithComedy);
    expect(result[0].title).toBe("High Match");
  });

  it("attaches a human-readable reason", () => {
    const candidates = [{ title: "New Movie", genres: ["Action"] }];
    const result = rankRecommendations(candidates, shelf);
    expect(result[0].reason).toContain("Action");
  });
});
