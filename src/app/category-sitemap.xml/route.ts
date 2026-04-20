import { getCategories } from "@/lib/wp";
import { SITE_ORIGIN, XML_HEADERS, urlSetXml } from "@/lib/sitemap-xml";

export const revalidate = 3600;

export async function GET() {
  const categories = await getCategories({ perPage: 100, exclude: [13] });
  const now = new Date();
  const xml = urlSetXml(
    categories.map((c) => ({
      loc: `${SITE_ORIGIN}/${c.slug}`,
      lastmod: now,
      changefreq: "daily",
      priority: 0.7,
    }))
  );
  return new Response(xml, { headers: XML_HEADERS });
}
