import { notFound } from "next/navigation";
import { WP_API } from "@/lib/wp";
import {
  POSTS_PER_SITEMAP,
  SITE_ORIGIN,
  XML_HEADERS,
  urlSetXml,
} from "@/lib/sitemap-xml";
import { getTotalTagCount } from "@/lib/wp-count";

export const revalidate = 3600;

type MinTag = { slug: string };

async function fetchChunk(pageNum: number): Promise<MinTag[]> {
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
): Promise<MinTag[]> {
  const url =
    `${WP_API}/tags?per_page=${perPage}&page=1&offset=${offset}` +
    `&hide_empty=true&orderby=count&order=desc&_fields=slug`;
  try {
    const r = await fetch(url, {
      next: { revalidate: 3600, tags: ["wp-tags-sitemap"] },
    });
    if (!r.ok) return [];
    return (await r.json()) as MinTag[];
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

  const total = await getTotalTagCount();
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_SITEMAP));
  if (pageNum > totalPages) notFound();

  const tags = await fetchChunk(pageNum);
  const now = new Date();
  const xml = urlSetXml(
    tags.map((t) => ({
      loc: `${SITE_ORIGIN}/tag/${t.slug}`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.5,
    }))
  );
  return new Response(xml, { headers: XML_HEADERS });
}
