import * as cms from "./payload";
import { IMAGE_SIZES, RESIZABLE, sizeKey } from "./image-sizes";

export const WP_BASE = "https://www.agrinewsthai.com";
export const WP_API = `${WP_BASE}/wp-json/wp/v2`;

/**
 * Where content comes from: "payload" (the new CMS, apps/cms) or "wordpress"
 * (the old site's REST API). Pages only use the functions in this file, which
 * return WordPress-shaped data either way.
 */
export const USE_PAYLOAD = process.env.CMS_SOURCE === "payload";

export type WPRendered = { rendered: string; protected?: boolean };

export type WPMedia = {
  id: number;
  source_url: string;
  alt_text?: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<
      string,
      { source_url: string; width: number; height: number }
    >;
  };
};

export type WPTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
  link: string;
  count?: number;
};

export type WPAuthor = {
  id: number;
  name: string;
  slug: string;
  avatar_urls?: Record<string, string>;
};

export type WPPost = {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt?: string;
  slug: string;
  link: string;
  title: WPRendered;
  excerpt: WPRendered;
  content: WPRendered;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    "wp:featuredmedia"?: WPMedia[];
    author?: WPAuthor[];
    "wp:term"?: WPTerm[][];
  };
};

export type WPCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
};

type FetchOpts = {
  revalidate?: number;
  tags?: string[];
};

async function wpFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  opts: FetchOpts = {}
): Promise<{ data: T; totalPages: number; total: number }> {
  const url = new URL(`${WP_API}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    next: {
      revalidate: opts.revalidate ?? 300,
      tags: opts.tags,
    },
  });

  if (!res.ok) {
    // 400 w/ rest_post_invalid_page_number when paging past end — return empty
    if (res.status === 400) {
      return { data: [] as unknown as T, totalPages: 0, total: 0 };
    }
    throw new Error(`WP fetch failed ${res.status}: ${url.toString()}`);
  }

  const totalPages = Number(res.headers.get("x-wp-totalpages") ?? "1");
  const total = Number(res.headers.get("x-wp-total") ?? "0");
  const data = (await res.json()) as T;
  return { data, totalPages, total };
}

export async function getPosts(params: {
  page?: number;
  perPage?: number;
  categories?: number | number[];
  categoriesExclude?: number[];
  exclude?: number | number[];
  include?: number[];
  search?: string;
  slug?: string;
  orderby?: "date" | "modified" | "relevance" | "title";
  order?: "asc" | "desc";
  sticky?: boolean;
  embed?: boolean;
  fields?: string[];
  offset?: number;
  after?: string;
} = {}) {
  if (USE_PAYLOAD) {
    // A `fields` list means a light query (sitemaps, counters): ids, dates, categories.
    return cms.findPosts({ ...params, minimal: Boolean(params.fields) });
  }
  const { categories, categoriesExclude, exclude, include, embed = true, fields, offset, after, ...rest } = params;
  return wpFetch<WPPost[]>(
    "/posts",
    {
      _embed: embed ? 1 : undefined,
      _fields: fields?.join(","),
      per_page: params.perPage ?? 10,
      page: params.page ?? 1,
      offset,
      categories: Array.isArray(categories) ? categories.join(",") : categories,
      categories_exclude: categoriesExclude?.join(","),
      exclude: Array.isArray(exclude) ? exclude.join(",") : exclude,
      include: include?.join(","),
      search: rest.search,
      slug: rest.slug,
      orderby: rest.orderby,
      order: rest.order,
      sticky: rest.sticky,
      after,
    },
    { tags: ["wp-posts"] }
  );
}

export async function getPostBySlug(slug: string) {
  if (USE_PAYLOAD) return cms.findPostBySlug(slug);
  const { data } = await wpFetch<WPPost[]>(
    "/posts",
    { slug, _embed: 1 },
    { tags: [`wp-post-${slug}`] }
  );
  return data[0] ?? null;
}

export async function getPostById(id: number, opts: { draft?: boolean } = {}) {
  if (USE_PAYLOAD) return opts.draft ? cms.findDraftPost(id) : cms.findPostById(id);
  try {
    const res = await fetch(`${WP_API}/posts/${id}?_embed=1`, {
      next: { revalidate: 300, tags: [`wp-post-${id}`] },
    });
    if (!res.ok) return null;
    return (await res.json()) as WPPost;
  } catch {
    return null;
  }
}

export async function getCategories(params: { perPage?: number; exclude?: number[] } = {}) {
  if (USE_PAYLOAD) return cms.findCategories(params);
  const { data } = await wpFetch<WPCategory[]>(
    "/categories",
    {
      per_page: params.perPage ?? 50,
      orderby: "count",
      order: "desc",
      hide_empty: true,
      exclude: params.exclude?.join(","),
    },
    { revalidate: 3600, tags: ["wp-categories"] }
  );
  return data;
}

export async function getCategoryBySlug(slug: string) {
  if (USE_PAYLOAD) return cms.findCategoryBySlug(slug);
  const { data } = await wpFetch<WPCategory[]>(
    "/categories",
    { slug },
    { revalidate: 3600, tags: [`wp-category-${slug}`] }
  );
  return data[0] ?? null;
}

export type WPTag = {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
};

export async function getTags(params: { perPage?: number; page?: number; offset?: number; search?: string; orderby?: "count" | "name"; order?: "asc" | "desc" } = {}) {
  if (USE_PAYLOAD) return cms.findTags(params);
  return wpFetch<WPTag[]>(
    "/tags",
    {
      per_page: params.perPage ?? 100,
      page: params.page ?? 1,
      orderby: params.orderby ?? "count",
      order: params.order ?? "desc",
      hide_empty: true,
      search: params.search,
      offset: params.offset,
    },
    { revalidate: 3600, tags: ["wp-tags"] }
  );
}

export async function getTagBySlug(slug: string) {
  if (USE_PAYLOAD) return cms.findTagBySlug(slug);
  const { data } = await wpFetch<WPTag[]>(
    "/tags",
    { slug },
    { revalidate: 3600, tags: [`wp-tag-${slug}`] }
  );
  return data[0] ?? null;
}

export async function getPostsByTag(params: {
  tagId: number;
  page?: number;
  perPage?: number;
}) {
  if (USE_PAYLOAD) return cms.findPosts({ tagId: params.tagId, page: params.page, perPage: params.perPage ?? 12 });
  return wpFetch<WPPost[]>(
    "/posts",
    {
      _embed: 1,
      per_page: params.perPage ?? 12,
      page: params.page ?? 1,
      tags: params.tagId,
    },
    { tags: [`wp-posts-tag-${params.tagId}`] }
  );
}

/* ---------- helpers for rendered WP HTML ---------- */

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  laquo: "«",
  raquo: "»",
  middot: "·",
  bull: "•",
  copy: "©",
  reg: "®",
  trade: "™",
};

export function decodeEntities(str: string): string {
  return (
    str
      // numeric decimal: &#8211; → en dash
      .replace(/&#(\d+);/g, (_, n) => {
        const code = parseInt(n, 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : _;
      })
      // numeric hex: &#x2013; → en dash
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
        const code = parseInt(n, 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : _;
      })
      // named: &amp; &nbsp; etc
      .replace(/&([a-zA-Z][a-zA-Z0-9]+);/g, (m, name) =>
        Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name)
          ? NAMED_ENTITIES[name]
          : m
      )
  );
}

export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ""))
    .replace(/\[\s*…\s*\]/g, "…")
    .replace(/\s+/g, " ")
    // Stray spaces just inside curly quotes ("“น้ำข้าวหมาก ”")
    .replace(/([“‘])\s+/g, "$1")
    .replace(/\s+([”’])/g, "$1")
    .trim();
}

/**
 * Clean excerpt for display / meta description: drops share-button text that
 * leaks in from the_content ("FacebookFacebookXTwitterLINELine"), the trailing
 * "[…]", and collapses &nbsp; and whitespace.
 */
export function getExcerpt(post: WPPost, max = 200): string {
  const text = stripHtml(post.excerpt?.rendered ?? "")
    .replace(/^(?:\s*(?:Facebook|X|Twitter|LINE|Line)\s*)+/, "")
    .replace(/\s*…\s*$/, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** True when an alt text is really an upload filename ("S 36413448", "852281005 107…"). */
export function isFilenameAlt(alt: string): boolean {
  const a = alt.trim();
  if (!a) return true;
  if (/[\u0E00-\u0E7F]/.test(a)) return false;
  return /\d{5,}/.test(a) || /\.(jpe?g|png|webp|gif)$/i.test(a) || /^(img|image|dsc|photo|s)[\s_-]?\d+/i.test(a);
}

/**
 * Prepare rendered post HTML for the page: lazy-load and async-decode
 * images, and replace empty or filename-like alt text with a description
 * derived from the headline.
 */
export function prepareContentHtml(html: string, title: string): string {
  let n = 0;
  const safeTitle = title.replace(/"/g, "&quot;");
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    n += 1;
    let out = tag;
    const m = out.match(/\salt=(["'])(.*?)\1/i);
    const alt = `${safeTitle} ภาพที่ ${n}`;
    if (!m) out = out.replace(/<img\b/i, `<img alt="${alt}"`);
    else if (isFilenameAlt(decodeEntities(m[2]))) out = out.replace(m[0], ` alt="${alt}"`);
    if (USE_PAYLOAD) out = resizedSrc(out);
    if (!/\sloading=/i.test(out)) out = out.replace(/<img\b/i, `<img loading="${n === 1 ? "eager" : "lazy"}"`);
    if (!/\sdecoding=/i.test(out)) out = out.replace(/<img\b/i, '<img decoding="async"');
    return out;
  });
}

/** URL of a file in the CMS media bucket, by its storage key ("uploads/2026/11/x.jpg", URL-encoded). */
export function resolveMediaKey(key: string): string {
  const media = process.env.MEDIA_URL?.replace(/\/$/, "");
  if (media) return `${media}/${key}`;
  const parts = key.split("/");
  const filename = parts.pop()!;
  const cms = (process.env.CMS_URL || "http://localhost:3001").replace(/\/$/, "");
  return `${cms}/api/media/file/${filename}?prefix=${encodeURIComponent(decodeURIComponent(parts.join("/")))}`;
}


/**
 * CMS media are full-size originals; serve body images through the Next.js
 * image optimizer (Cloudflare Images on Workers) at article-column widths.
 */
function resizedSrc(img: string): string {
  const src = img.match(/\ssrc=(["'])(.*?)\1/i)?.[2];
  // CMS body HTML stores library images as `media:{prefix}/{filename}`.
  if (!src?.startsWith("media:")) return img;
  const key = src.slice(6);
  const original = resolveMediaKey(key);
  const mime = /\.png$/i.test(key) ? "image/png" : /\.(jpe?g)$/i.test(key) ? "image/jpeg" : /\.webp$/i.test(key) ? "image/webp" : "";
  if (!RESIZABLE.test(mime)) return img.replace(src, original);
  // The resized WebP copies the CMS keeps next to every image (lib/image-sizes.ts).
  const copy = (w: number) => resolveMediaKey(sizeKey(key, w));
  const srcset = Object.values(IMAGE_SIZES).map((w) => `${copy(w)} ${w}w`).join(", ");
  // WebP copies for current browsers; the original JPG/PNG for the rest.
  const tag = img.replace(/\s(srcset|sizes)=(["']).*?\2/gi, "").replace(src, original);
  // If a copy is missing (not generated yet), drop the <source> so the
  // browser falls back to the original.
  const fallback = ` onerror="var s=this.parentNode&&this.parentNode.querySelector('source');if(s){s.remove()}else{this.onerror=null}"`;
  return `<picture><source type="image/webp" srcset="${srcset}" sizes="(max-width: 800px) 100vw, 760px" />${tag.replace(/<img\b/i, `<img${fallback}`)}</picture>`;
}

/** Target widths for the size names pages ask for (CMS sizes: lib/image-sizes.ts). */
const TARGET_WIDTH = { medium: 320, medium_large: 768, large: 1280, full: Infinity } as const;
// WordPress crops these to fixed shapes; they'd distort in a srcset.
const CROPPED = new Set(["thumbnail", "post-thumbnail"]);

export type FeaturedImage = {
  src: string;
  srcSet?: string;
  /** srcSet is WebP: `src` then points at the original JPG/PNG for browsers without WebP. */
  webp?: boolean;
  width: number;
  height: number;
  alt: string;
};

/**
 * Cover image of a story: the copy closest to the requested size plus a
 * srcset of every resized copy, for a plain <img> (no image optimizer).
 */
export function getFeaturedImage(
  post: WPPost,
  size: keyof typeof TARGET_WIDTH = "medium_large"
): FeaturedImage | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media?.source_url) return null;
  const alt =
    media.alt_text && !isFilenameAlt(media.alt_text) ? media.alt_text : stripHtml(post.title.rendered);
  const original = {
    source_url: media.source_url,
    width: media.media_details?.width ?? 1200,
    height: media.media_details?.height ?? 675,
  };
  const copies = Object.entries(media.media_details?.sizes ?? {})
    .filter(([name, c]) => !CROPPED.has(name) && name !== "full" && c?.source_url && c.width)
    .map(([, c]) => c)
    .sort((a, b) => a.width - b.width)
    .filter((c, i, all) => i === 0 || c.width !== all[i - 1].width);
  if (!copies.length) return { src: original.source_url, width: original.width, height: original.height, alt };

  const target = TARGET_WIDTH[size];
  const pick = copies.find((c) => c.width >= target) ?? copies[copies.length - 1];
  const srcSet = copies.map((c) => `${c.source_url} ${c.width}w`).join(", ");
  // CMS copies are WebP; keep the original as the fallback <img src>.
  if (copies.every((c) => /\.webp(\?|$)/i.test(c.source_url)))
    return { src: original.source_url, srcSet, webp: true, width: pick.width, height: pick.height, alt };
  return { src: pick.source_url, srcSet, width: pick.width, height: pick.height, alt };
}

export function getPrimaryCategory(post: WPPost): WPTerm | null {
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];
  const cats = terms.filter((t) => t.taxonomy === "category" && t.slug !== "slide");
  return cats[0] ?? terms.filter((t) => t.taxonomy === "category")[0] ?? null;
}

/**
 * Build the permalink path for a post — mirrors WordPress permalink structure
 * /{primary-category-slug}/{post-id}. Falls back to /news/{id} if no category.
 */
export function getPostHref(post: WPPost): string {
  const cat = getPrimaryCategory(post);
  return `/${cat?.slug ?? "news"}/${post.id}`;
}

/**
 * Same as getPostHref but accepts a WP `link` field absolute URL
 * (used when we only have minimal post data, e.g. in Ticker).
 */
export function hrefFromWpLink(link: string): string {
  try {
    const u = new URL(link);
    return u.pathname.replace(/\/+$/, "");
  } catch {
    return link;
  }
}

export function getAuthor(post: WPPost): WPAuthor | null {
  return post._embedded?.author?.[0] ?? null;
}

/**
 * Byline for display. WP accounts here mostly use login names ("opabo"), so
 * only show the author when it looks like a real display name (Thai script or
 * a space); otherwise credit the editorial team.
 */
export function getBylineName(post: WPPost): string {
  const name = getAuthor(post)?.name?.trim();
  if (name && (/[\u0E00-\u0E7F]/.test(name) || name.includes(" "))) return name;
  return "กองบรรณาธิการ";
}

export function formatThaiDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** "16 ต.ค. 2569 เวลา 14:30 น." — Thai news-style timestamp. */
export function formatThaiDateTime(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(d);
  const time = new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Bangkok" }).format(d);
  return `${date} เวลา ${time} น.`;
}

export function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - d);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "เมื่อสักครู่";
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชั่วโมงที่แล้ว`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} วันที่แล้ว`;
  return formatThaiDate(iso);
}

/** A tag by its exact display name (WP's search is a substring match). */
export async function getTagByName(name: string) {
  if (USE_PAYLOAD) return cms.findTagByName(name);
  const { data } = await getTags({ perPage: 20, search: name });
  return data.find((t) => t.name === name) ?? null;
}

export type WPPage = {
  id: number;
  slug: string;
  modified: string;
  title: WPRendered;
  content: WPRendered;
};

/** A published WordPress Page by slug, or null. */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  if (USE_PAYLOAD) return cms.findPageBySlug(slug);
  try {
    const { data } = await wpFetch<WPPage[]>(
      "/pages",
      { slug, _fields: "id,slug,modified,title,content" },
      { revalidate: 600, tags: [`wp-page-${slug}`] }
    );
    return data[0] ?? null;
  } catch {
    return null;
  }
}
