import { notFound } from "next/navigation";
import { WP_API } from "@/lib/wp";
import {
  POSTS_PER_SITEMAP,
  SITE_ORIGIN,
  XML_HEADERS,
  categorySlugMap,
  postPath,
  urlSetXml,
} from "@/lib/sitemap-xml";
import { getTotalPostCount } from "@/lib/wp-count";

export const revalidate = 1800;

type MinPost = { id: number; modified: string; categories?: number[] };

/**
 * Fetch a single 200-post chunk for sitemap page N (1-indexed).
 * WP REST caps per_page at 100, so each 200-chunk requires two sub-fetches.
 */
async function fetchChunk(pageNum: number): Promise<MinPost[]> {
  const start = (pageNum - 1) * POSTS_PER_SITEMAP;
  const halves = await Promise.all([
    fetchSlice(start, 100),
    fetchSlice(start + 100, 100),
  ]);
  return halves.flat();
}

async function fetchSlice(
  offset: number,
  perPage: number
): Promise<MinPost[]> {
  const url =
    `${WP_API}/posts?per_page=${perPage}&page=1&offset=${offset}` +
    `&_fields=id,modified,categories&orderby=date&order=desc`;
  try {
    const r = await fetch(url, {
      next: { revalidate: 1800, tags: ["wp-posts-sitemap"] },
    });
    if (!r.ok) return [];
    return (await r.json()) as MinPost[];
  } catch {
    return [];
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ num: string }> }
) {
  const { num } = await params;
  const pageNum = Number(num);
  if (!Number.isFinite(pageNum) || pageNum < 1) notFound();

  const total = await getTotalPostCount();
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_SITEMAP));
  if (pageNum > totalPages) notFound();

  const [posts, slugs] = await Promise.all([fetchChunk(pageNum), categorySlugMap()]);
  const xml = urlSetXml(
    posts.map((p) => ({
      loc: `${SITE_ORIGIN}${postPath(p.id, p.categories, slugs)}`,
      lastmod: p.modified,
      changefreq: "weekly",
      priority: 0.6,
    }))
  );
  return new Response(xml, { headers: XML_HEADERS });
}
