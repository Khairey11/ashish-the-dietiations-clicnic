import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

/**
 * GET /api/admin/services — list all services
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const services = await db.service.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch services" }, { status: 500 });
  }
}

const createSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(200),
  tagline: z.string().min(2).max(200),
  problem: z.string().max(2000).default(""),
  solution: z.string().max(2000).default(""),
  benefits: z.string().max(5000).default("[]"),
  duration: z.string().max(50).default("Ongoing"),
  accent: z.string().max(100).default("from-primary to-secondary"),
  category: z.string().max(50).default("weight"),
  iconName: z.string().max(50).default("Leaf"),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

/**
 * POST /api/admin/services — create a service
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

    const existing = await db.service.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A service with this slug already exists" }, { status: 409 });
    }

    const service = await db.service.create({ data: { ...parsed.data, category: parsed.data.category as any } });

    await writeAuditLog({
      userId: auth.userId,
      action: "SERVICE_CREATED",
      entity: "Service",
      entityId: service.id,
      after: serializeForAudit(service),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);
    return NextResponse.json({ success: false, error: "Failed to create service" }, { status: 500 });
  }
}
