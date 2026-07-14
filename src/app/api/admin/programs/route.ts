import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

/**
 * GET /api/admin/programs — list all programs
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const programs = await db.program.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: programs });
  } catch (error) {
    console.error("Failed to fetch programs:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch programs" }, { status: 500 });
  }
}

const createSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  duration: z.string().min(1).max(50),
  days: z.coerce.number().min(1).max(365),
  price: z.coerce.number().min(0),
  originalPrice: z.coerce.number().min(0).optional().default(0),
  tagline: z.string().min(2).max(200),
  features: z.string().max(5000).default("[]"),
  support: z.string().max(5000).default("[]"),
  accent: z.string().max(100).default("from-primary to-secondary"),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

/**
 * POST /api/admin/programs — create a program
 */
export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const existing = await db.program.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A program with this slug already exists" }, { status: 409 });
    }

    const program = await db.program.create({ data: parsed.data });

    await writeAuditLog({
      userId: auth.userId,
      action: "PROGRAM_CREATED",
      entity: "Program",
      entityId: program.id,
      after: serializeForAudit(program),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: program }, { status: 201 });
  } catch (error) {
    console.error("Failed to create program:", error);
    return NextResponse.json({ success: false, error: "Failed to create program" }, { status: 500 });
  }
}
