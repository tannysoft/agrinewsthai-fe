import { WP_API, stripHtml } from "@/lib/wp";
import { SITE_ORIGIN, categorySlugMap, postPath } from "@/lib/sitemap-xml";
import { SITE_NAME } from "@/lib/schema";

// Google News reads this often; keep it fresh.
export const revalidate = 300;

type NewsPost = { id: number; date_gmt: string; title: { rendered: string }; categories?: number[] };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Google News sitemap: stories published in the last 48 hours (max 1,000). */
async function recentPosts(): Promise<NewsPost[]> {
  const after = new Date(Date.now() - 48 * 3600 * 1000).toISOString().slice(0, 19);
  const out: NewsPost[] = [];
  for (let page = 1; page <= 10; page++) {
    const r = await fetch(
      `${WP_API}/posts?per_page=100&page=${page}&after=${after}&orderby=date&order=desc&_fields=id,date_gmt,title,categories`,
      { next: { revalidate: 300, tags: ["wp-posts-sitemap"] } }
    ).catch(() => null);
    if (!r?.ok) break;
    const batch = (await r.json()) as NewsPost[];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

export async function GET() {
  const [posts, slugs] = await Promise.all([recentPosts(), categorySlugMap()]);
  const body = posts
    .map(
      (p) => `  <url>
    <loc>${esc(`${SITE_ORIGIN}${postPath(p.id, p.categories, slugs)}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${esc(SITE_NAME)}</news:name>
        <news:language>th</news:language>
      </news:publication>
      <news:publication_date>${new Date(`${p.date_gmt}Z`).toISOString()}</news:publication_date>
      <news:title>${esc(stripHtml(p.title.rendered))}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" },
  });
}
