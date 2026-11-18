import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] }],
    sitemap: ["https://negoshi.news/sitemap.xml", "https://negoshi.news/news-sitemap.xml"],
  };
}
