import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/clients/[id]
 * Returns a full 360° client profile: user, patient, appointments, payments, notifications.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Client ID required" },
        { status: 400 }
      );
    }

    const client = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        patient: {
          select: {
            id: true,
            dietitianId: true,
            primaryGoal: true,
            medicalHistory: true,
            allergies: true,
            medications: true,
            condition: true,
            currentWeight: true,
            targetWeight: true,
            height: true,
            dateOfBirth: true,
            gender: true,
            address: true,
            emergencyPhone: true,
            startDate: true,
          },
        },
        appointments: {
          orderBy: { scheduledAt: "desc" },
          take: 20,
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            mode: true,
            dietitian: { select: { name: true } },
            service: { select: { title: true } },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            amount: true,
            currency: true,
            method: true,
            status: true,
            createdAt: true,
            program: { select: { duration: true } },
          },
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, title: true, body: true, isRead: true, createdAt: true },
        },
        _count: {
          select: {
            appointments: true,
            payments: true,
            notifications: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Scope check: DIETITIANs can only view clients assigned to them.
    if (auth.role === "DIETITIAN") {
      const dietitian = await db.dietitian.findUnique({
        where: { userId: auth.userId },
        select: { id: true },
      });
      const patient = client.patient;
      if (!dietitian || !patient || patient.dietitianId !== dietitian.id) {
        return NextResponse.json(
          { success: false, error: "Forbidden: this client is not assigned to you" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error("Failed to fetch client detail:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/clients/[id]
 * Approve, reject, suspend, or reactivate a client account.
 * Body: { action: "approve" | "reject" | "suspend" | "reactivate" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const action = String(body.action || "");

    const validActions = ["approve", "reject", "suspend", "reactivate"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use: approve, reject, suspend, or reactivate" },
        { status: 400 }
      );
    }

    const client = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    if (client.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, error: "This action is only for client accounts" },
        { status: 403 }
      );
    }

    if (action === "approve") {
      await db.user.update({
        where: { id },
        data: { isActive: true },
      });

      await db.notification.create({
        data: {
          userId: id,
          type: "ACCOUNT_APPROVED",
          title: "Your account has been approved!",
          body: "Welcome! You can now access your dashboard, book consultations, and track your progress.",
          link: "/dashboard",
        },
      }).catch(() => {});

      await db.auditLog.create({
        data: {
          userId: auth.userId,
          action: "CLIENT_APPROVED",
          entity: "User",
          entityId: id,
          after: JSON.stringify({ isActive: true }),
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: "Client approved successfully",
      });
    }

    if (action === "reject") {
      await db.user.delete({ where: { id } }).catch(() => {});

      await db.auditLog.create({
        data: {
          userId: auth.userId,
          action: "CLIENT_REJECTED",
          entity: "User",
          entityId: id,
          after: JSON.stringify({ deleted: true }),
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: "Client rejected and removed",
      });
    }

    if (action === "suspend") {
      await db.user.update({
        where: { id },
        data: { isActive: false },
      });

      await db.auditLog.create({
        data: {
          userId: auth.userId,
          action: "CLIENT_SUSPENDED",
          entity: "User",
          entityId: id,
          after: JSON.stringify({ isActive: false }),
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: "Client suspended",
      });
    }

    // reactivate
    await db.user.update({
      where: { id },
      data: { isActive: true },
    });

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        action: "CLIENT_REACTIVATED",
        entity: "User",
        entityId: id,
        after: JSON.stringify({ isActive: true }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Client reactivated",
    });
  } catch (error) {
    console.error("Failed to update client:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update client" },
      { status: 500 }
    );
  }
}