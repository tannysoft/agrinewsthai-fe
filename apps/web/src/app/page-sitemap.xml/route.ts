import { SITE_ORIGIN, XML_HEADERS, urlSetXml } from "@/lib/sitemap-xml";
import { CROPS } from "@/lib/crops";
import { TOPICS } from "@/lib/topics";

export const revalidate = 3600;

const STATIC_PAGES: { path: string; priority: number; changefreq: "hourly" | "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/prices", priority: 0.9, changefreq: "daily" },
  ...CROPS.map((c) => ({ path: `/prices/${c.slug}`, priority: 0.9, changefreq: "daily" as const })),
  ...TOPICS.map((t) => ({ path: `/topic/${t.slug}`, priority: 0.8, changefreq: "daily" as const })),
  { path: "/tags", priority: 0.6, changefreq: "daily" },
  { path: "/about", priority: 0.4, changefreq: "monthly" },
  { path: "/contact", priority: 0.4, changefreq: "monthly" },
];

export async function GET() {
  const now = new Date();
  const xml = urlSetXml(
    STATIC_PAGES.map((p) => ({
      loc: `${SITE_ORIGIN}${p.path}`,
      lastmod: now,
      priority: p.priority,
      changefreq: p.changefreq,
    }))
  );
  return new Response(xml, { headers: XML_HEADERS });
}
