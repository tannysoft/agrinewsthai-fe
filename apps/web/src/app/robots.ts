import type { MetadataRoute } from "next";

/** SITE_NOINDEX=1 on preview hosts (new.agrinewsthai.com) keeps them out of search. */
const NOINDEX = process.env.SITE_NOINDEX === "1";

export default function robots(): MetadataRoute.Robots {
  if (NOINDEX) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: [
      "https://www.agrinewsthai.com/sitemap_index.xml",
      "https://www.agrinewsthai.com/news-sitemap.xml",
    ],
  };
}
