import { SITE_ORIGIN, XML_HEADERS, urlSetXml } from "@/lib/sitemap-xml";

export const revalidate = 3600;

const STATIC_PAGES: { path: string; priority: number; changefreq: "hourly" | "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/latest", priority: 0.9, changefreq: "hourly" },
  { path: "/prices", priority: 0.9, changefreq: "daily" },
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
