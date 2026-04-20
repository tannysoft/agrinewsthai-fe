/**
 * Rank Math SEO helper — pulls OG/Twitter metadata and JSON-LD schema
 * using the official Rank Math Headless CMS endpoint:
 *   /wp-json/rankmath/v1/getHead?url={full-url}
 * Docs: https://rankmath.com/kb/headless-cms-support/
 *
 * Returns a serialized HTML <head> fragment which we parse with the same
 * regex helpers used before. Cached via Next.js fetch cache (6h by default).
 */

import { WP_BASE, decodeEntities } from "./wp";

export type RankMathHead = {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
  ogImageType?: string;
  ogType?: string;
  ogUpdatedTime?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  articleTags?: string[];
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterLabel1?: string;
  twitterData1?: string;
  twitterLabel2?: string;
  twitterData2?: string;
  /** Rank Math's own JSON-LD schema objects (usually NewsArticle, Person, etc.) */
  schema: unknown[];
};

function pickMeta(html: string, property: string): string | undefined {
  const re = new RegExp(
    `<meta\\s+(?:[^>]*\\s)?(?:property|name)=["']${property.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    )}["']\\s+content=["']([^"']*)["']`,
    "i"
  );
  const m = html.match(re);
  return m ? decodeEntities(m[1]) : undefined;
}

function pickAllMeta(html: string, property: string): string[] {
  const re = new RegExp(
    `<meta\\s+(?:[^>]*\\s)?(?:property|name)=["']${property.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    )}["']\\s+content=["']([^"']*)["']`,
    "gi"
  );
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push(decodeEntities(m[1]));
  }
  return out;
}

function pickLink(html: string, rel: string): string | undefined {
  const re = new RegExp(
    `<link\\s+(?:[^>]*\\s)?rel=["']${rel}["']\\s+href=["']([^"']*)["']`,
    "i"
  );
  const m = html.match(re);
  return m ? decodeEntities(m[1]) : undefined;
}

/** Extract every <script type="application/ld+json"> block. */
function pickJsonLd(html: string): unknown[] {
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks: unknown[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      // skip invalid blocks
    }
  }
  return blocks;
}

/**
 * Fetch & parse SEO metadata using Rank Math's Headless CMS API.
 * Returns null on any fetch failure so callers can fall back gracefully.
 *
 * @param url - The canonical WordPress URL (e.g. https://www.agrinewsthai.com/news/264821)
 */
export async function getRankMathHead(
  url: string,
  revalidate = 21600 // 6h
): Promise<RankMathHead | null> {
  try {
    const apiUrl = `${WP_BASE}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl, {
      next: { revalidate, tags: ["rankmath", `rankmath-${url}`] },
    });
    if (!res.ok) return null;

    const payload = (await res.json()) as {
      success?: boolean;
      head?: string;
      message?: string;
    };
    if (!payload.success || !payload.head) return null;

    // Rank Math returns the <title>…</title> + all <meta>/<link>/<script>
    // tags as a single HTML string. We parse it with the same regex helpers.
    const head = payload.head;

    const width = pickMeta(head, "og:image:width");
    const height = pickMeta(head, "og:image:height");

    return {
      title: pickMeta(head, "og:title") || pickMeta(head, "twitter:title"),
      description:
        pickMeta(head, "description") || pickMeta(head, "og:description"),
      canonical: pickLink(head, "canonical"),
      robots: pickMeta(head, "robots"),
      ogTitle: pickMeta(head, "og:title"),
      ogDescription: pickMeta(head, "og:description"),
      ogImage:
        pickMeta(head, "og:image:secure_url") || pickMeta(head, "og:image"),
      ogImageWidth: width ? Number(width) : undefined,
      ogImageHeight: height ? Number(height) : undefined,
      ogImageAlt: pickMeta(head, "og:image:alt"),
      ogImageType: pickMeta(head, "og:image:type"),
      ogType: pickMeta(head, "og:type"),
      ogUpdatedTime: pickMeta(head, "og:updated_time"),
      articlePublishedTime: pickMeta(head, "article:published_time"),
      articleModifiedTime: pickMeta(head, "article:modified_time"),
      articleAuthor: pickMeta(head, "article:author"),
      articleSection: pickMeta(head, "article:section"),
      articleTags: pickAllMeta(head, "article:tag"),
      twitterCard: pickMeta(head, "twitter:card"),
      twitterTitle: pickMeta(head, "twitter:title"),
      twitterDescription: pickMeta(head, "twitter:description"),
      twitterImage: pickMeta(head, "twitter:image"),
      twitterLabel1: pickMeta(head, "twitter:label1"),
      twitterData1: pickMeta(head, "twitter:data1"),
      twitterLabel2: pickMeta(head, "twitter:label2"),
      twitterData2: pickMeta(head, "twitter:data2"),
      schema: pickJsonLd(head),
    };
  } catch {
    return null;
  }
}
