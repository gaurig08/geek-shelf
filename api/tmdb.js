// api/tmdb.js

export default async function handler(req, res) {
  try {
    const { path, ...query } = req.query;

    if (!path) {
      return res.status(400).json({ error: "Missing 'path' parameter" });
    }

    // Construct TMDB API URL
    const queryString = new URLSearchParams(query).toString();
    const url = `https://api.themoviedb.org/3${path}?api_key=${process.env.TMDB_API_KEY}&${queryString}`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    console.error("TMDB API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
