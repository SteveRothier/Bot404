/** Recherche GIF Tenor / Giphy pour posts NPC (serveur uniquement). */

function pickGiphyUrl(item: {
  images?: {
    original?: { url?: string };
    downsized_medium?: { url?: string };
    fixed_height?: { url?: string };
  };
}): string | null {
  const img = item.images;
  return (
    img?.original?.url ??
    img?.downsized_medium?.url ??
    img?.fixed_height?.url ??
    null
  );
}

export function parseGiphySearchResponse(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown[] }).data;
  if (!Array.isArray(data) || data.length === 0) return null;
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const url = pickGiphyUrl(row as Parameters<typeof pickGiphyUrl>[0]);
    if (url) return url;
  }
  return null;
}

export async function searchGiphyGif(query: string): Promise<string | null> {
  const key = process.env.GIPHY_API_KEY?.trim();
  if (!key) return null;

  const q = query.trim().slice(0, 80) || "reaction";

  const searchUrl = new URL("https://api.giphy.com/v1/gifs/search");
  searchUrl.searchParams.set("api_key", key);
  searchUrl.searchParams.set("q", q);
  searchUrl.searchParams.set("limit", "5");
  searchUrl.searchParams.set("lang", "fr");
  searchUrl.searchParams.set("rating", "pg-13");

  try {
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(15_000) });
    if (res.ok) {
      const url = parseGiphySearchResponse(await res.json());
      if (url) return url;
    }
  } catch {
    /* fallback translate */
  }

  const translateUrl = new URL("https://api.giphy.com/v1/gifs/translate");
  translateUrl.searchParams.set("api_key", key);
  translateUrl.searchParams.set("s", q.slice(0, 50));
  translateUrl.searchParams.set("limit", "1");

  try {
    const res = await fetch(translateUrl, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    return parseGiphySearchResponse(await res.json());
  } catch {
    return null;
  }
}

export async function searchTenorGif(query: string): Promise<string | null> {
  const key = process.env.TENOR_API_KEY?.trim();
  if (!key) return null;

  const url = new URL("https://tenor.googleapis.com/v2/search");
  url.searchParams.set("q", query.trim().slice(0, 80) || "reaction");
  url.searchParams.set("key", key);
  url.searchParams.set("limit", "1");
  url.searchParams.set("media_filter", "gif");
  url.searchParams.set("locale", "fr_FR");

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      results?: Array<{
        media_formats?: {
          gif?: { url?: string };
          mediumgif?: { url?: string };
          tinygif?: { url?: string };
        };
      }>;
    };
    const media = data.results?.[0]?.media_formats;
    return (
      media?.gif?.url ?? media?.mediumgif?.url ?? media?.tinygif?.url ?? null
    );
  } catch {
    return null;
  }
}

export function extractGifSearchQuery(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[#@]/g, " ")
    .replace(/https?:\S+/g, " ");

  const words = cleaned
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 6);

  if (words.length > 0) return words.join(" ");

  return "cyberpunk dystopia reaction";
}

export async function fetchGifUrlForQuery(query: string): Promise<string | null> {
  const q = extractGifSearchQuery(query);
  return (await searchTenorGif(q)) ?? (await searchGiphyGif(q));
}
