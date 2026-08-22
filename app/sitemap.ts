import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getSiteUrl } from "@/lib/site";

// Same staleness issue as the homepage (see app/page.tsx) -- this has no
// request-time APIs, so without an explicit revalidate it would be baked
// once at build time and never pick up newly added courses/professors.
// A sitemap doesn't need per-request freshness, so revalidate periodically
// via ISR instead of forcing fully dynamic rendering.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const [courses, professors] = await Promise.all([
    prisma.course.findMany({ select: { code: true, updatedAt: true } }),
    prisma.professor.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/browse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/compare`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/guidelines`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${base}/course/${encodeURIComponent(c.code)}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const professorRoutes: MetadataRoute.Sitemap = professors.map((p) => ({
    url: `${base}/professor/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...courseRoutes, ...professorRoutes];
}
