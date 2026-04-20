export const WP_BASE = "https://www.agrinewsthai.com";
export const WP_API = `${WP_BASE}/wp-json/wp/v2`;

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
} = {}) {
  const { categories, exclude, include, embed = true, fields, offset, ...rest } = params;
  return wpFetch<WPPost[]>(
    "/posts",
    {
      _embed: embed ? 1 : undefined,
      _fields: fields?.join(","),
      per_page: params.perPage ?? 10,
      page: params.page ?? 1,
      offset,
      categories: Array.isArray(categories) ? categories.join(",") : categories,
      exclude: Array.isArray(exclude) ? exclude.join(",") : exclude,
      include: include?.join(","),
      search: rest.search,
      slug: rest.slug,
      orderby: rest.orderby,
      order: rest.order,
      sticky: rest.sticky,
    },
    { tags: ["wp-posts"] }
  );
}

export async function getPostBySlug(slug: string) {
  const { data } = await wpFetch<WPPost[]>(
    "/posts",
    { slug, _embed: 1 },
    { tags: [`wp-post-${slug}`] }
  );
  return data[0] ?? null;
}

export async function getPostById(id: number) {
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

export async function getTags(params: { perPage?: number; page?: number; search?: string; orderby?: "count" | "name"; order?: "asc" | "desc" } = {}) {
  return wpFetch<WPTag[]>(
    "/tags",
    {
      per_page: params.perPage ?? 100,
      page: params.page ?? 1,
      orderby: params.orderby ?? "count",
      order: params.order ?? "desc",
      hide_empty: true,
      search: params.search,
    },
    { revalidate: 3600, tags: ["wp-tags"] }
  );
}

export async function getTagBySlug(slug: string) {
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
    .trim();
}

export function getFeaturedImage(
  post: WPPost,
  size: "medium" | "medium_large" | "large" | "full" = "medium_large"
): { src: string; width: number; height: number; alt: string } | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media?.source_url) return null;
  const sized = media.media_details?.sizes?.[size];
  const full = media.media_details?.sizes?.full;
  const alt = media.alt_text || stripHtml(post.title.rendered);
  if (sized)
    return { src: sized.source_url, width: sized.width, height: sized.height, alt };
  if (full)
    return { src: full.source_url, width: full.width, height: full.height, alt };
  return {
    src: media.source_url,
    width: media.media_details?.width ?? 1200,
    height: media.media_details?.height ?? 675,
    alt,
  };
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

export function formatThaiDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
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
