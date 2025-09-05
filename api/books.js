// api/books.js

export default async function handler(req, res) {
  try {
    const { path, ...query } = req.query;

    if (!path) {
      return res.status(400).json({ error: "Missing 'path' parameter" });
    }

    // Construct Google Books API URL
    const queryString = new URLSearchParams(query).toString();
    const url = `https://www.googleapis.com/books/v1${path}?key=${process.env.GOOGLE_BOOKS_API_KEY}&${queryString}`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    console.error("Google Books API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
