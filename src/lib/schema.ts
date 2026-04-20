/**
 * Schema.org JSON-LD builders.
 *
 * All helpers produce plain objects — render via `<script type="application/ld+json">`
 * using the <JsonLd> component.
 */

import {
  WPPost,
  WPCategory,
  WPTag,
  getAuthor,
  getFeaturedImage,
  getPrimaryCategory,
  getPostHref,
  stripHtml,
} from "./wp";
import type { RankMathHead } from "./rankmath";

export const SITE_URL = "https://www.agrinewsthai.com";
export const SITE_NAME = "เรื่องเล่าข่าวเกษตร";
export const SITE_LOGO = `${SITE_URL}/logo.svg`;

export type JsonLd = Record<string, unknown>;

/** Organization schema — publisher identity. */
export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "AgriNewsThai",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: SITE_LOGO,
      contentUrl: SITE_LOGO,
      width: 904,
      height: 311,
      caption: SITE_NAME,
    },
    image: { "@id": `${SITE_URL}/#logo` },
    sameAs: [
      "https://www.facebook.com/agrinewsthai",
      "https://www.youtube.com/@agrinewsthai",
    ],
  };
}

/** WebSite schema with SearchAction (powers Google sitelinks search box). */
export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "ข่าวสาร ความรู้ และภูมิปัญญาการเกษตรไทย — ทันสมัย อ่านง่าย ใช้ได้จริง",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "th-TH",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * NewsArticle schema for a single post.
 * Prefers Rank Math metadata when available, falls back to WP fields.
 */
export function newsArticleSchema(
  post: WPPost,
  rankMath?: RankMathHead | null
): JsonLd {
  const href = getPostHref(post);
  const url = `${SITE_URL}${href}`;
  const stripSuffix = (s?: string) =>
    s?.replace(/\s+[»&].*$/, "").trim() ?? undefined;
  const title =
    stripSuffix(rankMath?.ogTitle) ||
    stripSuffix(rankMath?.title) ||
    stripHtml(post.title.rendered);
  const description =
    rankMath?.ogDescription ||
    rankMath?.description ||
    stripHtml(post.excerpt.rendered);
  const img =
    rankMath?.ogImage ||
    getFeaturedImage(post, "large")?.src ||
    `${SITE_URL}/logo.svg`;
  const imgW = rankMath?.ogImageWidth ?? 1200;
  const imgH = rankMath?.ogImageHeight ?? 675;
  const author = getAuthor(post);
  const category = getPrimaryCategory(post);
  const tags = (post._embedded?.["wp:term"]?.flat() ?? [])
    .filter((t) => t.taxonomy === "post_tag")
    .map((t) => t.name);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: title.slice(0, 110),
    alternativeHeadline: title,
    description: description.slice(0, 250),
    datePublished: rankMath?.articlePublishedTime || post.date,
    dateModified: rankMath?.articleModifiedTime || post.modified,
    inLanguage: "th-TH",
    articleSection: category?.name,
    keywords: tags.length ? tags.join(", ") : undefined,
    image: {
      "@type": "ImageObject",
      url: img,
      width: imgW,
      height: imgH,
    },
    author: author
      ? {
          "@type": "Person",
          name: author.name,
          url: `${SITE_URL}/author/${author.slug}`,
        }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

/** BreadcrumbList — one item per segment, last item = current page. */
export function breadcrumbSchema(
  items: { name: string; url: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** CollectionPage for category/tag/archive pages. */
export function collectionSchema(params: {
  url: string;
  name: string;
  description?: string;
  itemCount?: number;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${params.url}#collection`,
    url: params.url,
    name: params.name,
    description: params.description,
    inLanguage: "th-TH",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(params.itemCount != null && {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: params.itemCount,
      },
    }),
  };
}

export function tagCategoryToCollection(
  t: WPCategory | WPTag,
  url: string
): JsonLd {
  return collectionSchema({
    url,
    name: t.name,
    description: stripHtml(t.description),
    itemCount: t.count,
  });
}
