import { describe, it, expect, vi } from "vitest";
import { aggregateByFrequency } from "../getRecommendations";

describe("aggregateByFrequency", () => {
  it("ranks a title recommended by multiple sources above one recommended by only one", () => {
    const sourceA = { externalId: 1 };
    const sourceB = { externalId: 2 };

    const fetchOne = vi.fn((source) => {
      if (source === sourceA) {
        return Promise.resolve([
          { title: "Shared Movie", popularity: 10 },
          { title: "Only A", popularity: 50 },
        ]);
      }
      return Promise.resolve([
        { title: "Shared Movie", popularity: 20 },
        { title: "Only B", popularity: 5 },
      ]);
    });

    return aggregateByFrequency([sourceA, sourceB], fetchOne).then((result) => {
      expect(result[0].title).toBe("Shared Movie");
      expect(result[0].count).toBe(2);
    });
  });

  it("uses popularity as a tiebreaker between equally-frequent candidates", async () => {
    const source = { externalId: 1 };
    const fetchOne = () =>
      Promise.resolve([
        { title: "Low Pop", popularity: 5 },
        { title: "High Pop", popularity: 100 },
      ]);

    const result = await aggregateByFrequency([source], fetchOne);
    expect(result[0].title).toBe("High Pop");
  });

  it("keeps the highest popularity seen for a title across multiple sources", async () => {
    const sourceA = { externalId: 1 };
    const sourceB = { externalId: 2 };
    const fetchOne = (source) =>
      Promise.resolve([{ title: "X", popularity: source === sourceA ? 10 : 99 }]);

    const result = await aggregateByFrequency([sourceA, sourceB], fetchOne);
    expect(result[0].popularity).toBe(99);
  });

  it("does not double-count the same title twice from a single source", async () => {
    const source = { externalId: 1 };
    const fetchOne = () =>
      Promise.resolve([
        { title: "Dup", popularity: 1 },
        { title: "Dup", popularity: 2 },
      ]);

    const result = await aggregateByFrequency([source], fetchOne);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(1);
  });

  it("skips candidates with no title", async () => {
    const source = { externalId: 1 };
    const fetchOne = () => Promise.resolve([{ title: null, popularity: 1 }]);

    const result = await aggregateByFrequency([source], fetchOne);
    expect(result).toHaveLength(0);
  });
});
