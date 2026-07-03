import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";

function getClientIpSafe(req: NextRequest): string | undefined {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    undefined
  );
}

const LeadStatus = z.enum(["NEW", "CONTACTED", "QUALIFIED", "BOOKED", "CONVERTED", "LOST"]);
const LeadSource = z.enum(["WEBSITE", "WHATSAPP", "PHONE", "REFERRAL", "SOCIAL", "AD", "ORGANIC", "DIRECT"]);

const createSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(4).max(32),
  message: z.string().min(1).max(2000),
  service: z.string().max(120).optional().nullable(),
  source: LeadSource.default("WEBSITE"),
});

const updateSchema = z.object({
  id: z.string().min(1).max(40),
  status: LeadStatus.optional(),
  assignedTo: z.string().max(40).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
  followUpAt: z.string().datetime().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

    const where = status ? { status: status as any } : {};
    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        assignedUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
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
    const lead = await db.lead.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        message: parsed.data.message,
        service: parsed.data.service ?? null,
        source: parsed.data.source,
        status: "NEW",
      },
    });
    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    console.error("Failed to create lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { id, status, assignedTo, notes, followUpAt } = parsed.data;

    // Fetch before-state for audit
    const before = await db.lead.findUnique({ where: { id } });

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (notes !== undefined) updateData.notes = notes;
    if (followUpAt) updateData.followUpAt = new Date(followUpAt);
    if (status === "CONVERTED") updateData.convertedAt = new Date();

    const lead = await db.lead.update({
      where: { id },
      data: updateData,
    });

    await writeAuditLog({
      userId: auth.userId,
      action: "LEAD_UPDATED",
      entity: "Lead",
      entityId: id,
      before: serializeForAudit(before),
      after: serializeForAudit(lead),
      ipAddress: getClientIpSafe(req),
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lead" },
      { status: 500 }
    );
  }
}
