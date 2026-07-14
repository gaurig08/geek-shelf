// src/utils/getBookRecommendationsAI.js
//
// Uses Gemini (via /api/gemini) to generate book recommendations based on
// natural-language understanding of the user's shelf, instead of the
// fragile BISAC subject-string matching used before. An LLM actually
// understands that "Fourth Wing + Academy of Villains" means romantasy,
// dragons, dark academia - the way a person would explain it, not a
// keyword filter.
//
// Every suggested title is verified against Google Books' title search
// before being shown - if the model suggests something that doesn't
// actually exist there, it's silently dropped rather than shown broken
// (no poster, no way to add to shelf).

/** Builds the natural-language prompt from the user's Book shelf items. */
export const buildPrompt = (bookItems) => {
  const shelfLines = bookItems
    .map((item) => {
      const tags = [];
      if (item.favorite) tags.push("favorited");
      if (item.status) tags.push(`status: ${item.status}`);
      const genrePart = item.genre ? ` (${item.genre})` : "";
      return `- "${item.title}"${genrePart} - ${tags.join(", ")}`;
    })
    .join("\n");

  return `You are a knowledgeable librarian helping recommend books to a reader based on their reading shelf.

Their shelf:
${shelfLines}

Suggest exactly 6 other books this reader would likely enjoy, based on genre, themes, and tone - not just repeating the same author. Do not suggest any book already listed above.

Respond with ONLY a JSON array in this exact format, no other text, no markdown formatting:
[{"title": "Book Title", "author": "Author Name", "reason": "one short sentence why they'd like it"}]`;
};

/**
 * Parses Gemini's generateContent response shape and extracts the
 * suggested books array. Defensively strips markdown code fences in case
 * the model wraps the JSON despite being asked not to.
 */
export const parseGeminiResponse = (data) => {
  try {
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to parse Gemini response as JSON:", err);
    return [];
  }
};

const verifyBookExists = async (suggestion) => {
  const query = suggestion.author
    ? `intitle:${suggestion.title} inauthor:${suggestion.author}`
    : `intitle:${suggestion.title}`;

  try {
    const res = await fetch(`/api/books?path=/volumes&q=${encodeURIComponent(query)}&maxResults=1`);
    if (!res.ok) return null;
    const data = await res.json();
    const match = data.items?.[0];
    if (!match) return null;

    return {
      id: match.id,
      title: match.volumeInfo?.title || suggestion.title,
      poster: match.volumeInfo?.imageLinks?.thumbnail || null,
      category: "Book",
      raw: match,
    };
  } catch (err) {
    console.warn(`Book verification fetch failed for "${suggestion.title}":`, err.message);
    return null;
  }
};

/**
 * Full pipeline: prompt Gemini based on the user's Book shelf, parse its
 * suggestions, verify each one actually exists via Google Books, and
 * return up to topN verified candidates ready for display/add-to-shelf.
 */
export const getAIBookRecommendations = async (shelfItems, topN = 6) => {
  const bookItems = shelfItems.filter((i) => i.category === "Book");
  if (bookItems.length === 0) return [];

  const prompt = buildPrompt(bookItems);

  let data;
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      console.warn(`Gemini recommendation request failed (status ${res.status})`);
      return [];
    }
    data = await res.json();
  } catch (err) {
    console.warn("Gemini recommendation request errored:", err.message);
    return [];
  }

  const suggestions = parseGeminiResponse(data);
  if (suggestions.length === 0) return [];

  const shelfTitles = new Set(bookItems.map((i) => i.title.toLowerCase()));
  const filtered = suggestions.filter((s) => s.title && !shelfTitles.has(s.title.toLowerCase()));

  const verified = await Promise.all(filtered.map(verifyBookExists));
  return verified.filter(Boolean).slice(0, topN);
};
