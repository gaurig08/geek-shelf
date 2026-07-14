import { describe, it, expect } from "vitest";
import { buildPrompt, parseGeminiResponse } from "../getBookRecommendationsAI";

describe("buildPrompt", () => {
  it("includes each book's title, genre, and status in the prompt", () => {
    const books = [
      { title: "Fourth Wing", genre: "Fantasy, Romance", status: "Completed", favorite: true },
    ];
    const prompt = buildPrompt(books);
    expect(prompt).toContain("Fourth Wing");
    expect(prompt).toContain("Fantasy, Romance");
    expect(prompt).toContain("Completed");
    expect(prompt).toContain("favorited");
  });

  it("asks for exactly 6 suggestions in JSON format", () => {
    const prompt = buildPrompt([{ title: "Test Book" }]);
    expect(prompt).toContain("exactly 6");
    expect(prompt).toContain("JSON array");
  });

  it("handles books with no genre or status gracefully", () => {
    const prompt = buildPrompt([{ title: "Mystery Book" }]);
    expect(prompt).toContain("Mystery Book");
  });
});

describe("parseGeminiResponse", () => {
  it("extracts a valid JSON array from Gemini's response shape", () => {
    const data = {
      candidates: [
        { content: { parts: [{ text: '[{"title": "Book A", "author": "Author A"}]' }] } },
      ],
    };
    expect(parseGeminiResponse(data)).toEqual([{ title: "Book A", author: "Author A" }]);
  });

  it("strips markdown code fences if the model adds them anyway", () => {
    const data = {
      candidates: [
        { content: { parts: [{ text: '```json\n[{"title": "Book B"}]\n```' }] } },
      ],
    };
    expect(parseGeminiResponse(data)).toEqual([{ title: "Book B" }]);
  });

  it("returns an empty array for malformed JSON instead of throwing", () => {
    const data = {
      candidates: [{ content: { parts: [{ text: "not valid json at all" }] } }],
    };
    expect(parseGeminiResponse(data)).toEqual([]);
  });

  it("returns an empty array when the response has no candidates", () => {
    expect(parseGeminiResponse({})).toEqual([]);
    expect(parseGeminiResponse(null)).toEqual([]);
  });

  it("returns an empty array if the parsed JSON isn't an array", () => {
    const data = {
      candidates: [{ content: { parts: [{ text: '{"not": "an array"}' }] } }],
    };
    expect(parseGeminiResponse(data)).toEqual([]);
  });
});
