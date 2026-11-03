/**
 * Payload CMS data source. Reads the CMS REST API and returns the same
 * WordPress-shaped objects the pages already use (WPPost, WPCategory…), so
 * switching CMS_SOURCE between "wordpress" and "payload" needs no page
 * changes. Cache tags match the ones the CMS sends to /api/revalidate.
 */
import { stringify } from "qs-esm";
import type { WPAuthor, WPCategory, WPMedia, WPPage, WPPost, WPTag, WPTerm } from "./wp";

export const CMS_URL = (process.env.CMS_URL || "http://localhost:3001").replace(/\/$/, "");
const SITE = "https://www.agrinewsthai.com";

type Where = Record<string, unknown>;

type PMedia = {
  id: number;
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  /** Resized copies (packages/shared/src/image-sizes.ts); null until generated, and for GIF/SVG. */
  sizes?: Record<string, { url: string; width: number; height: number | null }> | null;
};
type PTerm = { id: number; name: string; slug: string; description?: string | null; postCount?: number | null; parent?: number | PTerm | null };
type PUser = { id: number; name: string; slug: string; showByline?: boolean | null };
type PSeo = {
  title?: string | null;
  description?: string | null;
  image?: PMedia | number | null;
  focusKeyword?: string | null;
  canonical?: string | null;
  noindex?: boolean | null;
  nofollow?: boolean | null;
};
export type PPost = {
  id: number;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  contentHtml?: string | null;
  featuredImage?: PMedia | number | null;
  categories?: (PTerm | number)[] | null;
  primaryCategory?: PTerm | number | null;
  tags?: (PTerm | number)[] | null;
  author?: PUser | number | null;
  publishedAt?: string | null;
  updatedAt: string;
  sticky?: boolean | null;
  meta?: PSeo | null;
};
type PPage = { id: number; slug: string; title: string; contentHtml?: string | null; updatedAt: string; meta?: PSeo | null };

type FindResult<T> = { docs: T[]; totalDocs: number; totalPages: number; page: number };

/** WordPress-shaped post that also carries the CMS SEO fields. */
export type CMSPost = WPPost & { _seo?: PSeo | null };

const LIST_SELECT = {
  title: true,
  slug: true,
  excerpt: true,
  featuredImage: true,
  categories: true,
  primaryCategory: true,
  tags: true,
  author: true,
  publishedAt: true,
  updatedAt: true,
  sticky: true,
};

const POPULATE = {
  // prefix + mimeType: the CMS builds `url` and `sizes` from them.
  media: { url: true, filename: true, prefix: true, mimeType: true, alt: true, width: true, height: true, sizes: true, sizesReady: true },
  categories: { name: true, slug: true },
  tags: { name: true, slug: true },
  users: { name: true, slug: true, showByline: true },
};

async function cms<T>(path: string, query: Record<string, unknown>, tags: string[], revalidate = 300): Promise<T | null> {
  const qs = stringify(query, { addQueryPrefix: true, encode: true });
  const res = await fetch(`${CMS_URL}/api${path}${qs}`, { next: { revalidate, tags } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CMS ${res.status}: ${path}${qs}`);
  return (await res.json()) as T;
}

// ---------- mapping to WordPress shapes ----------

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** WordPress `date` is Bangkok wall time without a zone; `date_gmt` is UTC without a zone. */
const bangkok = (iso: string) => new Date(Date.parse(iso) + 7 * 3600_000).toISOString().slice(0, 19);
const utc = (iso: string) => new Date(iso).toISOString().slice(0, 19);
const obj = <T>(v: T | number | null | undefined): T | null => (v && typeof v === "object" ? v : null);
const idOf = (v: { id: number } | number | null | undefined) => (typeof v === "number" ? v : (v?.id ?? 0));

export function absoluteMediaUrl(url?: string | null) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${CMS_URL}${url}`;
}

function toMedia(m: PMedia): WPMedia {
  return {
    id: m.id,
    source_url: absoluteMediaUrl(m.url),
    alt_text: m.alt ?? "",
    media_details: {
      width: m.width ?? undefined,
      height: m.height ?? undefined,
      sizes: Object.fromEntries(
        Object.entries(m.sizes ?? {}).map(([name, c]) => [
          name,
          { source_url: absoluteMediaUrl(c.url), width: c.width, height: c.height ?? Math.round(((m.height ?? 675) * c.width) / (m.width ?? 1200)) },
        ])
      ),
    },
  };
}

const term = (t: PTerm, taxonomy: "category" | "post_tag"): WPTerm => ({
  id: t.id,
  name: t.name,
  slug: t.slug,
  taxonomy,
  link: taxonomy === "category" ? `${SITE}/${t.slug}` : `${SITE}/tag/${t.slug}`,
});

export function toWPPost(p: PPost): CMSPost {
  const primary = obj(p.primaryCategory);
  const cats = (p.categories ?? []).map((c) => obj(c)).filter((c): c is PTerm => Boolean(c));
  // Primary category first: getPrimaryCategory() takes the first one.
  const orderedCats = primary ? [primary, ...cats.filter((c) => c.id !== primary.id)] : cats;
  const tags = (p.tags ?? []).map((t) => obj(t)).filter((t): t is PTerm => Boolean(t));
  const author = obj(p.author);
  const image = obj(p.featuredImage);
  const published = p.publishedAt ?? p.updatedAt;
  const catSlug = orderedCats.find((c) => c.slug !== "slide")?.slug ?? orderedCats[0]?.slug ?? "news";

  const authorOut: WPAuthor | null = author
    ? // Bylines only for accounts marked "show byline"; otherwise the page credits the newsroom.
      { id: author.id, name: author.showByline ? author.name : "", slug: author.slug }
    : null;

  return {
    id: p.id,
    date: bangkok(published),
    date_gmt: utc(published),
    modified: bangkok(p.updatedAt),
    modified_gmt: utc(p.updatedAt),
    slug: p.slug ?? String(p.id),
    link: `${SITE}/${catSlug}/${p.id}`,
    title: { rendered: esc(p.title) },
    excerpt: { rendered: p.excerpt ? `<p>${esc(p.excerpt)}</p>` : "" },
    content: { rendered: p.contentHtml ?? "" },
    author: idOf(p.author),
    featured_media: idOf(p.featuredImage),
    categories: orderedCats.map((c) => c.id),
    tags: tags.map((t) => t.id),
    _embedded: {
      "wp:featuredmedia": image ? [toMedia(image)] : undefined,
      author: authorOut ? [authorOut] : undefined,
      "wp:term": [orderedCats.map((c) => term(c, "category")), tags.map((t) => term(t, "post_tag"))],
    },
    _seo: p.meta ?? null,
  };
}

// ---------- queries ----------

/**
 * "Now" rounded *up* to 5 minutes: keeps fetch URLs cacheable, and a story
 * published a moment ago is included right away (the CMS revalidates on
 * publish). Scheduled stories may appear up to 5 minutes early.
 */
function publishedNow(): Where {
  const t = Math.ceil(Date.now() / 300_000) * 300_000;
  return { publishedAt: { less_than_equal: new Date(t).toISOString() } };
}

const SORT: Record<string, string> = { date: "publishedAt", modified: "updatedAt", title: "title", relevance: "publishedAt" };

export type PostQuery = {
  page?: number;
  perPage?: number;
  categories?: number | number[];
  categoriesExclude?: number[];
  exclude?: number | number[];
  include?: number[];
  search?: string;
  slug?: string;
  tagId?: number;
  orderby?: "date" | "modified" | "relevance" | "title";
  order?: "asc" | "desc";
  sticky?: boolean;
  after?: string;
  offset?: number;
  /** Fewer fields for sitemaps and counters. */
  minimal?: boolean;
};

export async function findPosts(q: PostQuery) {
  const and: Where[] = [publishedNow()];
  const list = (v?: number | number[]) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
  if (list(q.categories).length) and.push({ categories: { in: list(q.categories) } });
  // Exclusion on a has-many field matches posts with *any other* category, so
  // exclude by the (single) primary category instead.
  if (q.categoriesExclude?.length) and.push({ primaryCategory: { not_in: q.categoriesExclude } });
  if (list(q.exclude).length) and.push({ id: { not_in: list(q.exclude) } });
  if (q.include?.length) and.push({ id: { in: q.include } });
  if (q.slug) and.push({ slug: { equals: safeDecode(q.slug) } });
  if (q.tagId) and.push({ tags: { in: [q.tagId] } });
  if (q.sticky !== undefined) and.push({ sticky: { equals: q.sticky } });
  // WordPress-style `after` has no zone and means UTC.
  if (q.after) and.push({ publishedAt: { greater_than: new Date(/Z$|[+-]\d\d:\d\d$/.test(q.after) ? q.after : `${q.after}Z`).toISOString() } });
  if (q.search) and.push({ or: [{ title: { like: q.search } }, { excerpt: { like: q.search } }] });

  const perPage = q.perPage ?? 10;
  const sort = `${q.order === "asc" ? "" : "-"}${SORT[q.orderby ?? "date"]}`;
  const tags = q.tagId ? ["posts", `tag-posts-${q.tagId}`] : ["posts"];
  const fetchPage = (page: number) =>
    cms<FindResult<PPost>>(
      "/posts",
      {
        where: { and },
        limit: perPage,
        page,
        sort,
        depth: q.minimal ? 0 : 1,
        select: q.minimal ? { categories: true, primaryCategory: true, title: true, publishedAt: true, updatedAt: true } : LIST_SELECT,
        ...(q.minimal ? {} : { populate: POPULATE }),
      },
      tags
    );

  // REST has no offset. Read the (at most two) pages of `perPage` that cover
  // [offset, offset + perPage) — never one big page: the CMS caps queries
  // filtered by a relation at 100 rows (D1's bound-parameter limit).
  let res: FindResult<PPost> | null;
  let docs: PPost[];
  if (q.offset) {
    const first = Math.floor(q.offset / perPage) + 1;
    const skip = q.offset % perPage;
    const pages = await Promise.all(skip ? [fetchPage(first), fetchPage(first + 1)] : [fetchPage(first)]);
    res = pages[0];
    docs = pages.flatMap((r) => r?.docs ?? []).slice(skip, skip + perPage);
  } else {
    res = await fetchPage(q.page ?? 1);
    docs = res?.docs ?? [];
  }
  return {
    data: docs.map((d) => (q.minimal ? toMinimalPost(d) : toWPPost(d))),
    total: res?.totalDocs ?? 0,
    totalPages: res ? Math.ceil(res.totalDocs / perPage) : 0,
  };
}

/** Sitemap rows: categories are ids only (primary first). */
function toMinimalPost(p: PPost): CMSPost {
  const primary = idOf(p.primaryCategory);
  const cats = (p.categories ?? []).map((c) => idOf(c as PTerm | number));
  const published = p.publishedAt ?? p.updatedAt;
  return {
    id: p.id,
    date: bangkok(published),
    date_gmt: utc(published),
    modified: bangkok(p.updatedAt),
    modified_gmt: utc(p.updatedAt),
    slug: "",
    link: "",
    title: { rendered: esc(p.title) },
    excerpt: { rendered: "" },
    content: { rendered: "" },
    author: 0,
    featured_media: 0,
    categories: primary ? [primary, ...cats.filter((c) => c !== primary)] : cats,
    tags: [],
  };
}

export async function findPostById(id: number): Promise<CMSPost | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const res = await cms<FindResult<PPost>>(
    "/posts",
    {
      where: { and: [{ id: { equals: id } }, publishedNow()] },
      limit: 1,
      depth: 1,
      select: { ...LIST_SELECT, contentHtml: true, meta: true },
      populate: POPULATE,
    },
    ["posts", `post-${id}`]
  ).catch(() => null);
  const doc = res?.docs[0];
  return doc ? toWPPost(doc) : null;
}

/**
 * Latest saved version of a story, drafts included, for editor previews.
 * Uses an API key of a CMS user and is never cached.
 */
export async function findDraftPost(id: number): Promise<CMSPost | null> {
  const key = process.env.CMS_PREVIEW_API_KEY;
  if (!key || !Number.isInteger(id)) return null;
  const qs = stringify({ draft: true, depth: 1, populate: POPULATE }, { addQueryPrefix: true, encode: true });
  const res = await fetch(`${CMS_URL}/api/posts/${id}${qs}`, {
    cache: "no-store",
    headers: { authorization: `users API-Key ${key}` },
  });
  if (!res.ok) return null;
  return toWPPost((await res.json()) as PPost);
}

export async function findPostBySlug(slug: string): Promise<CMSPost | null> {
  const res = await cms<FindResult<PPost>>(
    "/posts",
    {
      where: { and: [{ slug: { equals: safeDecode(slug) } }, publishedNow()] },
      limit: 1,
      depth: 1,
      select: { ...LIST_SELECT, contentHtml: true, meta: true },
      populate: POPULATE,
    },
    ["posts"]
  );
  const doc = res?.docs[0];
  return doc ? toWPPost(doc) : null;
}

/**
 * Published-story count. No time filter, so the URL (and its hour-long cache)
 * stays stable; counts only sort and hide empty categories.
 */
export async function countPosts(where: Where = {}) {
  const res = await cms<{ totalDocs: number }>("/posts/count", { where: { and: [{ _status: { equals: "published" } }, where] } }, ["posts"], 3600);
  return res?.totalDocs ?? 0;
}

// ---------- taxonomies ----------

export async function findCategories(opts: { exclude?: number[] } = {}): Promise<WPCategory[]> {
  const res = await cms<FindResult<PTerm>>(
    "/categories",
    { pagination: false, depth: 0, sort: "order", where: opts.exclude?.length ? { id: { not_in: opts.exclude } } : {} },
    ["categories"],
    // Same window as the rest of the content, so a category added straight
    // in the database (not through the CMS hooks) shows within 5 minutes.
    300
  );
  const docs = res?.docs ?? [];
  const counts = await Promise.all(docs.map((c) => countPosts({ categories: { in: [c.id] } })));
  return docs
    .map((c, i) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      count: counts[i],
      parent: idOf(c.parent as PTerm | number | null),
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

export async function findCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const res = await cms<FindResult<PTerm>>(
    "/categories",
    { where: { slug: { equals: safeDecode(slug) } }, limit: 1, depth: 0 },
    ["categories"],
    3600
  );
  const c = res?.docs[0];
  if (!c) return null;
  return { id: c.id, name: c.name, slug: c.slug, description: c.description ?? "", count: await countPosts({ categories: { in: [c.id] } }), parent: idOf(c.parent as PTerm | number | null) };
}

const toTag = (t: PTerm): WPTag => ({ id: t.id, name: t.name, slug: t.slug, description: t.description ?? "", count: t.postCount ?? 0 });

export async function findTags(q: { perPage?: number; page?: number; offset?: number; search?: string; orderby?: "count" | "name"; order?: "asc" | "desc" }) {
  const perPage = q.perPage ?? 100;
  const and: Where[] = [{ postCount: { greater_than: 0 } }];
  if (q.search) and.push({ name: { like: q.search } });
  const field = q.orderby === "name" ? "name" : "postCount";
  const dir = q.order ?? (field === "name" ? "asc" : "desc");
  const page = q.offset ? Math.floor(q.offset / perPage) + 1 : (q.page ?? 1);
  const res = await cms<FindResult<PTerm>>(
    "/tags",
    { where: { and }, limit: perPage, page, depth: 0, sort: `${dir === "desc" ? "-" : ""}${field}`, select: { name: true, slug: true, description: true, postCount: true } },
    ["tags"],
    3600
  );
  return { data: (res?.docs ?? []).map(toTag), total: res?.totalDocs ?? 0, totalPages: res?.totalPages ?? 0 };
}

export async function findTagBySlug(slug: string): Promise<WPTag | null> {
  const s = safeDecode(slug);
  const res = await cms<FindResult<PTerm>>("/tags", { where: { slug: { equals: s } }, limit: 1, depth: 0 }, ["tags", `tag-${s}`], 3600);
  return res?.docs[0] ? toTag(res.docs[0]) : null;
}

export async function findTagByName(name: string): Promise<WPTag | null> {
  const res = await cms<FindResult<PTerm>>("/tags", { where: { name: { equals: name } }, limit: 1, depth: 0 }, ["tags"], 3600);
  return res?.docs[0] ? toTag(res.docs[0]) : null;
}

export async function countTags() {
  const res = await cms<{ totalDocs: number }>("/tags/count", { where: { postCount: { greater_than: 0 } } }, ["tags"], 3600);
  return res?.totalDocs ?? 0;
}

// ---------- pages ----------

export async function findPageBySlug(slug: string): Promise<WPPage | null> {
  const res = await cms<FindResult<PPage>>(
    "/pages",
    { where: { slug: { equals: slug } }, limit: 1, depth: 0, select: { slug: true, title: true, contentHtml: true, updatedAt: true } },
    ["pages", `page-${slug}`],
    600
  ).catch(() => null);
  const p = res?.docs[0];
  if (!p) return null;
  return { id: p.id, slug: p.slug, modified: bangkok(p.updatedAt), title: { rendered: esc(p.title) }, content: { rendered: p.contentHtml ?? "" } };
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
