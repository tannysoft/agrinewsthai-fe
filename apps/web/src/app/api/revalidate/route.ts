import { revalidateTag } from "next/cache";

/**
 * Called by the CMS after content changes (apps/cms/src/hooks/revalidate.ts)
 * with the cache tags to refresh, e.g. ["posts", "post-302274"].
 * Pages serve the cached copy once more while fresh data loads.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === "string").slice(0, 50) : [];
  for (const tag of tags) revalidateTag(tag, "max");
  return Response.json({ ok: true, revalidated: tags });
}
