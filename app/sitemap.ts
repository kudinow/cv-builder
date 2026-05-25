import type { MetadataRoute } from "next";
import { professions } from "@/lib/seo/professions";
import { blogPosts } from "@/lib/seo/blog";

const BASE = "https://cv-builder.ru";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    // Wave 1
    { url: `${BASE}/obrazec-rezume`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    // Wave 2
    { url: `${BASE}/kak-sostavit-rezume`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/soprovoditelnoe-pismo`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/ai-resume`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // Wave 3 — index
    { url: `${BASE}/rezume`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // Wave 4
    { url: `${BASE}/rezume-na-angliyskom`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/konstruktor`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/adaptaciya-resume`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    // Terms
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const professionUrls: MetadataRoute.Sitemap = professions.map((p) => ({
    url: `${BASE}/rezume/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticUrls, ...professionUrls, ...blogUrls];
}
