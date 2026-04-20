import { WP_API } from "@/lib/wp";
import {
  POSTS_PER_SITEMAP,
  SITE_ORIGIN,
  XML_HEADERS,
  indexXml,
} from "@/lib/sitemap-xml";
import { getTotalPostCount, getTotalTagCount } from "@/lib/wp-count";

export const revalidate = 3600;

async function latestPostModified(): Promise<string | null> {
  try {
    const r = await fetch(
      `${WP_API}/posts?per_page=1&page=1&_fields=modified&orderby=modified&order=desc`,
      { next: { revalidate: 1800, tags: ["wp-posts-sitemap"] } }
    );
    if (!r.ok) return null;
    const data = (await r.json()) as { modified: string }[];
    return data[0]?.modified ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const [totalPosts, totalTags, latestMod] = await Promise.all([
    getTotalPostCount(),
    getTotalTagCount(),
    latestPostModified(),
  ]);
  const totalPostPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_SITEMAP));
  const totalTagPages = Math.max(1, Math.ceil(totalTags / POSTS_PER_SITEMAP));
  const now = new Date();

  // Rank Math-style: paginated post sitemaps followed by taxonomy + page sitemaps.
  const entries: { loc: string; lastmod?: string | Date }[] = [];
  for (let n = 1; n <= totalPostPages; n++) {
    entries.push({
      loc: `${SITE_ORIGIN}/post-sitemap${n}.xml`,
      lastmod: n === 1 && latestMod ? latestMod : now,
    });
  }
  entries.push({ loc: `${SITE_ORIGIN}/category-sitemap.xml`, lastmod: now });
  for (let n = 1; n <= totalTagPages; n++) {
    entries.push({
      loc: `${SITE_ORIGIN}/post_tag-sitemap${n}.xml`,
      lastmod: now,
    });
  }
  entries.push({ loc: `${SITE_ORIGIN}/page-sitemap.xml`, lastmod: now });

  const xml = indexXml(entries);
  return new Response(xml, { headers: XML_HEADERS });
}
