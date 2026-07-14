/**
 * Server-side DB queries for public-facing content.
 *
 * Reads from the database (seeded from src/lib/data.ts). Falls back to the
 * static arrays if the DB is unavailable, so the site never 500s.
 *
 * NOTE: Field names here MUST match the Prisma schema exactly. The static
 * data.ts arrays use different names (e.g. `name` vs `title`, `description`
 * vs `solution`) — we map between them below.
 */

import { db } from "@/lib/db";
import {
  blogPosts as staticBlogPosts,
  services as staticServices,
  programs as staticPrograms,
  dietitians as staticDietitians,
  testimonials as staticTestimonials,
  faqs as staticFaqs,
} from "@/lib/data";

export async function getDbBlogPosts() {
  try {
    const rows = await db.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });
    if (rows.length === 0) return staticBlogPosts;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      content: r.content,
      category: r.coverAccent || "General", // no category field on BlogPost; use coverAccent as a fallback label
      author: "The Dietitian's Clinic", // authorId is a relation, not a name
      date: (r.publishedAt || r.createdAt).toISOString(),
      readingTime: r.readingTime,
      accent: r.coverAccent || "from-emerald-500 to-teal-500",
      tags: r.tags ? JSON.parse(r.tags) : [],
    }));
  } catch {
    return staticBlogPosts;
  }
}

export async function getDbServices() {
  try {
    const rows = await db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length === 0) return staticServices;
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      tagline: r.tagline,
      description: r.solution || r.problem,
      icon: r.iconName,
      duration: r.duration,
      category: r.category as string,
      price: 0, // Service has no price field in schema
      features: r.benefits ? JSON.parse(r.benefits) : [],
      outcomes: [],
      forWho: [],
    }));
  } catch {
    return staticServices;
  }
}
