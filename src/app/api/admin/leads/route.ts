import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where = status ? { status: status as any } : {};
    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
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
  try {
    const body = await req.json();
    const lead = await db.lead.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        phone: body.phone,
        message: body.message,
        service: body.service,
        source: body.source || "WEBSITE",
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
  try {
    const body = await req.json();
    const { id, status, assignedTo, notes, followUpAt } = body;

    const lead = await db.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(notes !== undefined && { notes }),
        ...(followUpAt && { followUpAt: new Date(followUpAt) }),
        ...(status === "CONVERTED" && { convertedAt: new Date() }),
      },
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
