import type { MetadataRoute } from "next";
import { getCategories, getPosts, getTags } from "@/lib/wp";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://agrinewsthai.com";
  const [{ data: recent }, categories, { data: tags }] = await Promise.all([
    getPosts({
      perPage: 100,
      page: 1,
      embed: false,
      fields: ["id", "modified"],
    }),
    getCategories({ exclude: [13] }),
    getTags({ perPage: 100 }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/latest`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/tags`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/${c.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const tagRoutes = tags.map((t) => ({
    url: `${base}/tag/${t.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Post URLs use /{category-slug}/{id}. We fetch categories primary from embedded.
  // Without _embed to keep cache small, we conservatively use /news/{id} fallback
  // — robots will follow internal links for the exact categorized URL anyway.
  const postRoutes = recent.map((p) => ({
    url: `${base}/news/${p.id}`,
    lastModified: new Date(p.modified),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...tagRoutes, ...postRoutes];
}
