import { notFound } from "next/navigation";
import { getTags } from "@/lib/wp";
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

async function fetchSlice(offset: number, perPage: number): Promise<MinTag[]> {
  try {
    const { data } = await getTags({ offset, perPage, orderby: "count", order: "desc" });
    return data.map((t) => ({ slug: t.slug }));
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
      // WordPress slugs arrive percent-encoded; CMS slugs are Thai text.
      loc: `${SITE_ORIGIN}/tag/${/%[0-9a-f]{2}/i.test(t.slug) ? t.slug : encodeURIComponent(t.slug)}`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.5,
    }))
  );
  return new Response(xml, { headers: XML_HEADERS });
}
