export type UnsplashPhoto = { url: string; alt: string; credit: string; creditUrl: string };
type PuckBlock = { type: string; props: Record<string, unknown> };

// Bakes a resolved photo URL into the page's Hero block at generation time
// (not fetched live on every page view — cheaper and avoids Unsplash rate
// limits on a public-facing page).
export function injectHeroPhoto<T extends PuckBlock[]>(content: T, photo: UnsplashPhoto | null): T {
  if (!photo) return content;
  return content.map((block) =>
    block.type === "Hero" ? { ...block, props: { ...block.props, backgroundImageUrl: photo.url, backgroundImageCredit: photo.credit } } : block
  ) as T;
}

// Fetches one relevant photo so a generated page never looks empty/default —
// falls back to null (Hero renders its plain gradient background) if no key
// or the request fails, same graceful-degradation pattern as the other
// integrations in this app.
export async function searchPhoto(query: string): Promise<UnsplashPhoto | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );
    if (!res.ok) throw new Error(`Unsplash API ${res.status}`);
    const data = await res.json();
    const photo = data.results?.[0];
    if (!photo) return null;
    return {
      url: photo.urls.regular,
      alt: photo.alt_description || query,
      credit: photo.user?.name || "Unsplash",
      creditUrl: photo.user?.links?.html || "https://unsplash.com",
    };
  } catch (err) {
    console.error("[unsplash] search failed", err);
    return null;
  }
}
