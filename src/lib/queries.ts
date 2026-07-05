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

export async function getDbPrograms() {
  try {
    const rows = await db.program.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
    if (rows.length === 0) return staticPrograms;
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      duration: r.duration,
      tagline: r.tagline,
      description: r.tagline, // Program has no description field
      price: r.price,
      originalPrice: r.originalPrice || undefined,
      accent: r.accent,
      features: r.features ? JSON.parse(r.features) : [],
      support: r.support ? JSON.parse(r.support) : [],
      recommended: r.isPopular,
    }));
  } catch {
    return staticPrograms;
  }
}

export async function getDbDietitians() {
  try {
    const rows = await db.dietitian.findMany({
      where: { isActive: true },
      orderBy: { rating: "desc" },
    });
    if (rows.length === 0) return staticDietitians;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      credentials: r.credentials || "",
      specialty: r.specialty || "",
      bio: r.bio || "",
      experience: r.experience || 0,
      languages: r.languages ? JSON.parse(r.languages) : [],
      rating: r.rating || 5,
      reviews: r.reviewsCount || 0,
      initials: r.initials || "",
      accent: r.accent || "from-emerald-500 to-teal-500",
      availability: r.availability || "Mon–Sat",
      focus: r.focus ? JSON.parse(r.focus) : [],
    }));
  } catch {
    return staticDietitians;
  }
}

export async function getDbTestimonials() {
  try {
    const rows = await db.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
    });
    if (rows.length === 0) return staticTestimonials;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      age: r.age || undefined,
      location: r.city || "",
      condition: r.condition,
      duration: r.duration || "",
      result: r.highlight || "",
      quote: r.quote,
      rating: r.rating,
      accent: r.accent,
      initials: r.initials,
      featured: r.isFeatured,
      date: r.createdAt.toISOString(),
    }));
  } catch {
    return staticTestimonials;
  }
}

export async function getDbFaqs() {
  try {
    const rows = await db.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length === 0) return staticFaqs;
    return rows.map((r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category,
    }));
  } catch {
    return staticFaqs;
  }
}
