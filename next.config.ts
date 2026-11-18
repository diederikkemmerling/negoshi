import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // public .xml URLs for feeds; the route folders have plain names
  async rewrites() {
    return [
      { source: "/news-sitemap.xml", destination: "/news-sitemap" },
      { source: "/:lang(en|nl|es)/rss.xml", destination: "/:lang/feed" },
    ];
  },
};

export default nextConfig;
