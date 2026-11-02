import type { Metadata } from "next";
import { stripHtml, type WPCategory } from "./wp";
import { CATEGORY_COPY, NOINDEX_CATEGORY_SLUGS } from "./categories";
import { SITE_URL } from "./schema";

export function categoryCopy(cat: WPCategory) {
  const copy = CATEGORY_COPY[cat.slug];
  return {
    title: copy?.title ?? cat.name,
    description:
      stripHtml(cat.description) ||
      copy?.description ||
      `ข่าวและบทความในหมวด${cat.name} จากเรื่องเล่าข่าวเกษตร`,
  };
}

/** Metadata for a category archive; page > 1 gets its own canonical and a page suffix. */
export function categoryMetadata(cat: WPCategory, page = 1): Metadata {
  const { title, description } = categoryCopy(cat);
  const path = page > 1 ? `/${cat.slug}/page/${page}` : `/${cat.slug}`;
  const url = `${SITE_URL}${path}`;
  const fullTitle = page > 1 ? `${title} หน้า ${page}` : title;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: NOINDEX_CATEGORY_SLUGS.has(cat.slug) ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", url, title: fullTitle, description, locale: "th_TH" },
  };
}
