import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://aicon.dev";
  const now = new Date("2026-06-14");
  return [
    { url: `${base}/fa`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/en`, lastModified: now, changeFrequency: "monthly", priority: 1 },
  ];
}
