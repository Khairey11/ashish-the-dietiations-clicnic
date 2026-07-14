import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireContentEditor } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";

const querySchema = z.object({
  status: z.enum(["ALL", "PUBLISHED", "DRAFT", "FEATURED"]).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /api/admin/blog — list all blog posts (including drafts)
 */
export async function GET(req: NextRequest) {
  const auth = await requireContentEditor(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      status: searchParams.get("status") || undefined,
      limit: searchParams.get("limit") || 50,
      offset: searchParams.get("offset") || 0,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {};
    if (parsed.data.status === "PUBLISHED") where.isPublished = true;
    if (parsed.data.status === "DRAFT") where.isPublished = false;
    if (parsed.data.status === "FEATURED") where.isFeatured = true;

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: parsed.data.limit,
        skip: parsed.data.offset,
      }),
      db.blogPost.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: posts, total });
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase, hyphens only"),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(10).max(50000),
  tags: z.string().max(500).optional().default("[]"),
  coverAccent: z.string().max(100).optional().default("from-primary to-secondary"),
  readingTime: z.coerce.number().min(1).max(60).default(5),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

/**
 * POST /api/admin/blog — create a new blog post
 */
export async function POST(req: NextRequest) {
  const auth = await requireContentEditor(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.blogPost.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A post with this slug already exists" },
        { status: 409 }
      );
    }

    const post = await db.blogPost.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        tags: parsed.data.tags,
        coverAccent: parsed.data.coverAccent,
        readingTime: parsed.data.readingTime,
        isPublished: parsed.data.isPublished,
        isFeatured: parsed.data.isFeatured,
        publishedAt: parsed.data.isPublished ? new Date() : null,
      },
    });

    await writeAuditLog({
      userId: auth.userId,
      action: "BLOG_POST_CREATED",
      entity: "BlogPost",
      entityId: post.id,
      after: serializeForAudit(post),
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
