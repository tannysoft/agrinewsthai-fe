/**
 * Helpers that read `x-wp-total` / `x-wp-totalpages` headers from the WP
 * REST API without pulling the full response bodies. Used by the sitemap
 * generators to know how many sub-sitemap chunks to produce.
 */

import { WP_API } from "./wp";

export async function getTotalPostCount(): Promise<number> {
  try {
    const res = await fetch(`${WP_API}/posts?per_page=1&_fields=id`, {
      next: { revalidate: 3600, tags: ["wp-post-count"] },
    });
    if (!res.ok) return 0;
    const total = Number(res.headers.get("x-wp-total") ?? "0");
    return Number.isFinite(total) ? total : 0;
  } catch {
    return 0;
  }
}

export async function getTotalTagCount(): Promise<number> {
  try {
    const res = await fetch(
      `${WP_API}/tags?per_page=1&hide_empty=true&_fields=id`,
      { next: { revalidate: 3600, tags: ["wp-tag-count"] } }
    );
    if (!res.ok) return 0;
    const total = Number(res.headers.get("x-wp-total") ?? "0");
    return Number.isFinite(total) ? total : 0;
  } catch {
    return 0;
  }
}
