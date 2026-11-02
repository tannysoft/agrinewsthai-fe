import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** Hosts serving CMS media: the public R2 domain and the CMS itself (local dev). */
const mediaHosts = [process.env.MEDIA_URL, process.env.CMS_URL]
  .filter((u): u is string => Boolean(u))
  .map((u) => new URL(u))
  .map((u) => ({ protocol: u.protocol.replace(":", "") as "http" | "https", hostname: u.hostname, port: u.port || undefined }));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...mediaHosts,
      { protocol: "https", hostname: "files.agrinewsthai.com" },
      { protocol: "https", hostname: "cms.agrinewsthai.com" },
      { protocol: "https", hostname: "www.agrinewsthai.com", pathname: "/wp-content/**" },
      { protocol: "https", hostname: "agrinewsthai.com", pathname: "/wp-content/**" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "i1.wp.com" },
      { protocol: "https", hostname: "i2.wp.com" },
    ],
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
