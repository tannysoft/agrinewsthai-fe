/**
 * Shared helpers for building Rank Math-style XML sitemaps.
 */

export const SITE_ORIGIN = "https://www.agrinewsthai.com";
export const SITEMAP_XSL = `/main-sitemap.xsl`;

/** Rank Math default — 200 URLs per sitemap chunk. */
export const POSTS_PER_SITEMAP = 200;

type UrlEntry = {
  loc: string;
  lastmod?: string | Date;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  images?: { loc: string; title?: string; caption?: string }[];
};

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const iso = (d: string | Date | undefined) =>
  d ? (d instanceof Date ? d : new Date(d)).toISOString() : undefined;

export function urlSetXml(urls: UrlEntry[]): string {
  const body = urls
    .map((u) => {
      const lines: string[] = [`  <url>`, `    <loc>${esc(u.loc)}</loc>`];
      const lastmod = iso(u.lastmod);
      if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
      if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
      if (u.priority != null)
        lines.push(`    <priority>${u.priority.toFixed(1)}</priority>`);
      if (u.images?.length) {
        for (const img of u.images) {
          lines.push(`    <image:image>`);
          lines.push(`      <image:loc>${esc(img.loc)}</image:loc>`);
          if (img.title)
            lines.push(`      <image:title>${esc(img.title)}</image:title>`);
          if (img.caption)
            lines.push(`      <image:caption>${esc(img.caption)}</image:caption>`);
          lines.push(`    </image:image>`);
        }
      }
      lines.push(`  </url>`);
      return lines.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITEMAP_XSL}"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`;
}

export function indexXml(
  children: { loc: string; lastmod?: string | Date }[]
): string {
  const body = children
    .map((c) => {
      const lastmod = iso(c.lastmod);
      return [
        `  <sitemap>`,
        `    <loc>${esc(c.loc)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
        `  </sitemap>`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITEMAP_XSL}"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
}

export const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control":
    "public, s-maxage=3600, stale-while-revalidate=86400",
};
