/**
 * Server-side DB queries for public-facing content.
 *
 * Reads from the database (seeded from src/lib/data.ts). Falls back to the
 * static arrays if the DB is unavailable, so the site never 500s.
 *
 * NOTE: Field names here MUST match the Prisma schema exactly. The static
 * data.ts arrays use different names (e.g. `name` vs `title`, `description`
 * vs `solution`) — we map between them below.
 *
 * Every getter returns objects shaped like the static arrays so callers
 * can swap `import { services } from "@/lib/data"` for
 * `const services = await getDbServices()` with minimal code changes.
 */

import {
  Activity,
  Apple,
  Baby,
  Dumbbell,
  GraduationCap,
  Globe,
  HeartPulse,
  Heart,
  Leaf,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { db } from "@/lib/db";
import {
  blogPosts as staticBlogPosts,
  services as staticServices,
  programs as staticPrograms,
  dietitians as staticDietitians,
  testimonials as staticTestimonials,
  faqs as staticFaqs,
  blogArticles as staticBlogArticles,
  type BlogArticle,
  type BlogPost,
  type Service,
  type Program,
  type Dietitian,
  type Testimonial,
  type FAQ,
} from "@/lib/data";

// ---------- helpers ----------

/** Safe JSON.parse that returns a fallback on malformed input. */
function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Lucide icon lookup — keyed by the names used in data.ts / seed.ts. */
const ICON_MAP: Record<string, LucideIcon> = {
  Activity, Apple, Baby, Dumbbell, GraduationCap, Globe,
  HeartPulse, Heart, Leaf, TrendingDown, TrendingUp, Users, Zap,
};
function iconFromName(name: string): LucideIcon {
  return ICON_MAP[name] || Activity;
}

/** Map Prisma's SCREAMING_SNAK_CASE ServiceCategory enum to the lowercase
 *  dash-joined string the static data.ts uses (e.g. "LIFE_STAGE" → "life-stage"). */
function categoryFromEnum(c: string): Service["category"] {
  const lower = c.toLowerCase().replace(/_/g, "-");
  const allowed: Service["category"][] = ["weight", "medical", "life-stage", "performance", "corporate"];
  return (allowed as string[]).includes(lower) ? (lower as Service["category"]) : "weight";
}

// ---------- blog ----------

export async function getDbBlogPosts(): Promise<BlogPost[]> {
  try {
    const rows = await db.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      include: { category: true, author: true },
    });
    if (rows.length === 0) return staticBlogPosts;
    return rows.map((r) => ({
      // Use the slug as `id` so blog-list.tsx's `/blog/${post.id}` links work.
      id: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      category: r.category?.name || "General",
      author: r.author?.name || "The Dietitian's Clinic",
      date: (r.publishedAt || r.createdAt).toISOString(),
      readingTime: r.readingTime,
      tags: safeJsonParse<string[]>(r.tags, []),
      accent: r.coverAccent || "from-emerald-500 to-teal-500",
      featured: r.isFeatured,
    }));
  } catch {
    return staticBlogPosts;
  }
}

export async function getDbBlogPostBySlug(slug: string): Promise<BlogArticle | null> {
  // Try the DB first.
  try {
    const r = await db.blogPost.findUnique({
      where: { slug },
      include: { category: true, author: true },
    });
    if (r && r.isPublished) {
      // The schema's `content` field is Markdown / serialised JSON; we
      // attempt to parse it into the {heading, body}[] shape BlogArticle
      // expects. If it doesn't parse, treat it as a single section.
      let sections: { heading: string; body: string }[] = [];
      try {
        const parsed = JSON.parse(r.content);
        if (Array.isArray(parsed)) {
          sections = parsed.filter(
            (s): s is { heading: string; body: string } =>
              typeof s === "object" && s !== null &&
              typeof (s as { heading?: unknown }).heading === "string" &&
              typeof (s as { body?: unknown }).body === "string"
          );
        }
      } catch {
        if (r.content && r.content.trim()) {
          sections = [{ heading: r.title, body: r.content }];
        }
      }
      return {
        id: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        category: r.category?.name || "General",
        author: r.author?.name || "The Dietitian's Clinic",
        date: (r.publishedAt || r.createdAt).toISOString(),
        readingTime: r.readingTime,
        tags: safeJsonParse<string[]>(r.tags, []),
        accent: r.coverAccent || "from-emerald-500 to-teal-500",
        featured: r.isFeatured,
        content: sections,
        authorBio: "",
        authorInitials: (r.author?.name || "?")
          .split(/\s+/)
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        authorAccent: r.coverAccent || "from-emerald-500 to-teal-500",
      };
    }
  } catch {
    // fall through to static
  }
  return staticBlogArticles.find((a) => a.id === slug) || null;
}

// ---------- services ----------

export async function getDbServices(): Promise<Service[]> {
  try {
    const rows = await db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length === 0) return staticServices;
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      tagline: r.tagline,
      problem: r.problem,
      solution: r.solution,
      benefits: safeJsonParse<string[]>(r.benefits, []),
      duration: r.duration,
      accent: r.accent || "from-emerald-500 to-teal-500",
      category: categoryFromEnum(r.category),
      icon: iconFromName(r.iconName),
    }));
  } catch {
    return staticServices;
  }
}

export async function getDbServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const r = await db.service.findUnique({ where: { slug } });
    if (r && r.isActive) {
      return {
        slug: r.slug,
        title: r.title,
        tagline: r.tagline,
        problem: r.problem,
        solution: r.solution,
        benefits: safeJsonParse<string[]>(r.benefits, []),
        duration: r.duration,
        accent: r.accent || "from-emerald-500 to-teal-500",
        category: categoryFromEnum(r.category),
        icon: iconFromName(r.iconName),
      };
    }
  } catch {
    // fall through
  }
  return staticServices.find((s) => s.slug === slug) || null;
}

// ---------- programs ----------

export async function getDbPrograms(): Promise<Program[]> {
  try {
    const rows = await db.program.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length === 0) return staticPrograms;
    return rows.map((r) => ({
      // Use the slug as `id` so consumers that key on `program.id` still work.
      id: r.slug,
      duration: r.duration,
      days: r.days,
      price: r.price,
      originalPrice: r.originalPrice,
      tagline: r.tagline,
      popular: r.isPopular,
      features: safeJsonParse<string[]>(r.features, []),
      support: safeJsonParse<string[]>(r.support, []),
      accent: r.accent || "from-emerald-500 to-teal-500",
    }));
  } catch {
    return staticPrograms;
  }
}

// ---------- dietitians ----------

export async function getDbDietitians(): Promise<Dietitian[]> {
  try {
    const rows = await db.dietitian.findMany({
      where: { isActive: true },
      orderBy: { rating: "desc" },
    });
    if (rows.length === 0) return staticDietitians;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      credentials: r.credentials,
      specialty: r.specialty,
      experience: r.experience,
      languages: safeJsonParse<string[]>(r.languages, []),
      rating: r.rating,
      reviews: r.reviewsCount,
      bio: r.bio,
      initials: r.initials,
      accent: r.accent || "from-emerald-500 to-teal-500",
      availability: r.availability,
      focus: safeJsonParse<string[]>(r.focus, []),
    }));
  } catch {
    return staticDietitians;
  }
}

// ---------- testimonials ----------

export async function getDbTestimonials(): Promise<Testimonial[]> {
  try {
    const rows = await db.testimonial.findMany({
      where: { isApproved: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
    if (rows.length === 0) return staticTestimonials;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      age: r.age ?? 0,
      city: r.city || "",
      condition: r.condition,
      rating: r.rating,
      beforeWeight: r.beforeWeight ?? 0,
      afterWeight: r.afterWeight ?? 0,
      duration: r.duration || "",
      quote: r.quote,
      highlight: r.highlight,
      initials: r.initials,
      accent: r.accent || "from-emerald-500 to-teal-500",
      tag: (r.tag as Testimonial["tag"]) || "weight-loss",
    }));
  } catch {
    return staticTestimonials;
  }
}

// ---------- FAQs ----------

export async function getDbFaqs(): Promise<FAQ[]> {
  try {
    const rows = await db.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length === 0) return staticFaqs;
    return rows.map((r) => ({
      question: r.question,
      answer: r.answer,
      category: r.category,
    }));
  } catch {
    return staticFaqs;
  }
}
