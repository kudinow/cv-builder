import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/interview",
          "/adapt$",
          "/adapt/",
          "/create",
          "/cover-letter",
          "/cover-letters",
          "/promo",
          "/tokens",
          "/result/",
          "/resume/",
          "/auth",
          "/callback",
        ],
      },
    ],
    sitemap: "https://cv-builder.ru/sitemap.xml",
    host: "https://cv-builder.ru",
  };
}
