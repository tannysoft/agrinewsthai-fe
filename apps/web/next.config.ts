import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Images are plain <img> tags pointing at resized copies on the media
  // domain (WordPress sizes, or the CMS's own — packages/shared/src/image-sizes.ts).
  images: { unoptimized: true },
  // Build-time pages all query the CMS (one D1 database). Fewer at once, and
  // retries, keep the full-text searches from overloading it mid-build.
  experimental: {
    cpus: 4,
    staticGenerationMaxConcurrency: 2,
    staticGenerationRetryCount: 3,
  },
  // Workspace package shipped as TypeScript source.
  transpilePackages: ["@agrinewsthai/shared"],
  async headers() {
    // Preview hosts (SITE_NOINDEX=1) must not compete with www in search.
    if (process.env.SITE_NOINDEX !== "1") return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  async rewrites() {
    return [
      // Rank Math-style paginated post sitemaps — /post-sitemap{N}.xml →
      // internal route handler /api-sitemap/post/{N}
      {
        source: "/post-sitemap:num(\\d+).xml",
        destination: "/api-sitemap/post/:num",
      },
      {
        source: "/post_tag-sitemap:num(\\d+).xml",
        destination: "/api-sitemap/post_tag/:num",
      },
    ];
  },
  async redirects() {
    return [
      // Old WordPress media URLs → the same files on the R2 media domain.
      {
        source: "/wp-content/uploads/:path*",
        destination: "https://files.agrinewsthai.com/:path*",
        permanent: true,
      },
      // WordPress shortlinks /?p={id} → the story (which then canonicalises its category).
      {
        source: "/",
        has: [{ type: "query", key: "p", value: "(?<id>\\d+)" }],
        destination: "/news/:id",
        permanent: true,
      },
      // WordPress home pagination.
      { source: "/page/:num(\\d+)", destination: "/news/page/:num", permanent: true },
      // Old duplicate of พืชเศรษฐกิจ (SEO audit, Oct 2026) — must precede the generic /category rule.
      { source: "/category/industrial-drop/:rest*", destination: "/economic-crops", permanent: true },
      { source: "/industrial-drop/:rest*", destination: "/economic-crops", permanent: true },
      // The "latest" listing was folded into the ข่าวเกษตร category.
      { source: "/latest", destination: "/news", permanent: true },
      { source: "/latest/page/:num", destination: "/news/page/:num", permanent: true },
      // Legacy `/category/{slug}` → new `/{slug}`
      {
        source: "/category/:slug",
        destination: "/:slug",
        permanent: true,
      },
      // Legacy paginated `/category/{slug}/page/{n}` → `/{slug}/page/{n}`
      {
        source: "/category/:slug/page/:num",
        destination: "/:slug/page/:num",
        permanent: true,
      },
      // Next.js's auto-generated `/sitemap.xml` was removed — forward to
      // the Rank Math-style index.
      {
        source: "/sitemap.xml",
        destination: "/sitemap_index.xml",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

// Gives `next dev` access to the Cloudflare bindings declared in wrangler.jsonc.
if (process.env.NODE_ENV === "development") initOpenNextCloudflareForDev();
