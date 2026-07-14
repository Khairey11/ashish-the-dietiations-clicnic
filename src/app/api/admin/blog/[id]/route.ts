import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/ratelimit";import { requireContentEditor } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().min(10).max(500).optional(),
  content: z.string().min(10).max(50000).optional(),
  tags: z.string().max(500).optional(),
  coverAccent: z.string().max(100).optional(),
  readingTime: z.coerce.number().min(1).max(60).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

/**
 * GET /api/admin/blog/[id] — fetch a single post for editing
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireContentEditor(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const post = await db.blogPost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/blog/[id] — update a blog post
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireContentEditor(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const before = await db.blogPost.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changing
    if (parsed.data.slug && parsed.data.slug !== before.slug) {
      const existing = await db.blogPost.findUnique({ where: { slug: parsed.data.slug } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "A post with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // If publishing for the first time, set publishedAt
    const wasDraft = !before.isPublished;
    const isPublishing = parsed.data.isPublished === true && wasDraft;

    const post = await db.blogPost.update({
      where: { id },
      data: {
        ...parsed.data,
        publishedAt: isPublishing ? new Date() : before.publishedAt,
      },
    });

    await writeAuditLog({
      userId: auth.userId,
      action: "BLOG_POST_UPDATED",
      entity: "BlogPost",
      entityId: id,
      before: serializeForAudit(before),
      after: serializeForAudit(post),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/blog/[id] — delete a blog post
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireContentEditor(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const before = await db.blogPost.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    await db.blogPost.delete({ where: { id } });

    await writeAuditLog({
      userId: auth.userId,
      action: "BLOG_POST_DELETED",
      entity: "BlogPost",
      entityId: id,
      before: serializeForAudit(before),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
