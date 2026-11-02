import { notFound } from "next/navigation";
import { getPosts } from "@/lib/wp";
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

/** UTC with a zone; WordPress `modified` is Bangkok wall time. */
const utcModified = (p: { modified: string; modified_gmt?: string }) => (p.modified_gmt ? `${p.modified_gmt}Z` : p.modified);

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

async function fetchSlice(offset: number, perPage: number): Promise<MinPost[]> {
  try {
    const { data } = await getPosts({ offset, perPage, orderby: "date", order: "desc", embed: false, fields: ["id", "modified", "modified_gmt", "categories"] });
    return data.map((p) => ({ id: p.id, modified: utcModified(p), categories: p.categories }));
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
