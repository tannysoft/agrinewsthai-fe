import { getCategoryBySlug, getExcerpt, getFeaturedImage, getPostHref, getPosts, getPrimaryCategory, stripHtml, type WPPost } from "./wp";
import { SITE_NAME } from "./schema";

const SITE = "https://www.agrinewsthai.com";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function item(p: WPPost) {
  const url = `${SITE}${getPostHref(p)}`;
  const img = getFeaturedImage(p, "large");
  const cat = getPrimaryCategory(p);
  return `    <item>
      <title>${esc(stripHtml(p.title.rendered))}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${new Date(`${p.date_gmt}Z`).toUTCString()}</pubDate>
      ${cat ? `<category>${esc(cat.name)}</category>` : ""}
      <description>${esc(getExcerpt(p, 300))}</description>
      ${img ? `<media:content url="${esc(img.src)}" medium="image" />` : ""}
    </item>`;
}

/**
 * RSS 2.0 for the latest stories (WordPress served /feed and /{category}/feed;
 * readers and aggregators still subscribe to them).
 */
export async function rssResponse(categorySlug?: string) {
  const category = categorySlug ? await getCategoryBySlug(categorySlug) : null;
  if (categorySlug && !category) return new Response("Not found", { status: 404 });
  const { data } = await getPosts({ perPage: 30, categories: category?.id, categoriesExclude: category ? undefined : [13] });
  const self = `${SITE}${category ? `/${category.slug}` : ""}/feed`;
  const title = category ? `${category.name} – ${SITE_NAME}` : SITE_NAME;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(title)}</title>
    <link>${SITE}${category ? `/${category.slug}` : ""}</link>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    <description>${esc(category?.description || "ข่าวเกษตรล่าสุด ราคาพืชผล นโยบายเกษตร")}</description>
    <language>th</language>
${data.map(item).join("\n")}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600, s-maxage=600" },
  });
}
