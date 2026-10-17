import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
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
