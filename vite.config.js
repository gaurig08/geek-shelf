import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel's /api/*.js serverless functions don't run under Vite's dev
// server - they only work when deployed, or via `vercel dev`. This plugin
// mirrors the same proxy logic locally so `npm run dev` works out of the
// box too. It only runs in dev (configureServer); production builds still
// use the real Vercel functions in api/, this has no effect on deployment.
const localApiProxy = (env) => ({
  name: 'local-api-proxy',
  configureServer(server) {
    const fetchWithRetry = async (target, retries = 2, options = undefined) => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          return await fetch(target, options);
        } catch (err) {
          const isLastAttempt = attempt === retries;
          console.warn(`[local-api-proxy] attempt ${attempt + 1} failed: ${err.message}${isLastAttempt ? '' : ' - retrying...'}`);
          if (isLastAttempt) throw err;
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1))); // short backoff
        }
      }
    };

    const proxyTo = (baseUrl, keyParam, apiKey) => async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost');
        const path = url.searchParams.get('path');
        if (!path) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Missing 'path' parameter" }));
          return;
        }
        url.searchParams.delete('path');
        const target = `${baseUrl}${path}?${keyParam}=${apiKey}&${url.searchParams.toString()}`;
        const response = await fetchWithRetry(target);
        const data = await response.json();
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      } catch (err) {
        console.error('[local-api-proxy] error after retries:', err);
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Could not reach the external API after retrying.',
          detail: err.message,
          hint: 'This is usually a local network issue (antivirus/VPN doing SSL inspection, or an unstable connection), not a bug in the app. Try again, or check your network settings.',
        }));
      }
    };

    server.middlewares.use('/api/tmdb', proxyTo('https://api.themoviedb.org/3', 'api_key', env.TMDB_API_KEY));
    server.middlewares.use('/api/books', proxyTo('https://www.googleapis.com/books/v1', 'key', env.GOOGLE_BOOKS_API_KEY));

    // Gemini needs POST with a JSON body (not a simple GET+query-param
    // proxy like TMDB/Books), so it gets its own handler.
    server.middlewares.use('/api/gemini', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }
      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');

        if (!body.prompt) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Missing 'prompt' in request body" }));
          return;
        }

        const target = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`;
        const response = await fetchWithRetry(target, 2, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: body.prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
          }),
        });
        const data = await response.json();
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      } catch (err) {
        console.error('[local-api-proxy] Gemini error:', err);
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Could not reach Gemini API.', detail: err.message }));
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), localApiProxy(env)],
  };
})
