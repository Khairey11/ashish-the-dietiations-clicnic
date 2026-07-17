import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const sendSchema = z.object({
  recipientId: z.string().min(1),
  body: z.string().min(1, "Message cannot be empty").max(2000),
  subject: z.string().max(200).optional(),
});

/**
 * GET /api/messages
 * Returns conversations for the logged-in user.
 * For admins: all messages grouped by conversation partner.
 * For clients: all messages between them and any staff.
 */
export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const conversationWith = searchParams.get("with");

    let where: Record<string, unknown> = {};

    if (conversationWith) {
      // Get messages in a specific conversation
      where = {
        OR: [
          { senderId: auth.userId, recipientId: conversationWith },
          { senderId: conversationWith, recipientId: auth.userId },
        ],
      };
    } else {
      // Get all messages involving this user
      where = {
        OR: [
          { senderId: auth.userId },
          { recipientId: auth.userId },
        ],
      };
    }

    const messages = await db.message.findMany({
      where,
      orderBy: { sentAt: "desc" },
      take: 100,
      include: {
        sender: { select: { id: true, name: true, role: true } },
        recipient: { select: { id: true, name: true, role: true } },
      },
    });

    // Mark messages as read if the user is the recipient
    if (conversationWith) {
      await db.message.updateMany({
        where: {
          recipientId: auth.userId,
          senderId: conversationWith,
          isRead: false,
        },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Sends a message from the logged-in user to a recipient.
 */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const recipient = await db.user.findUnique({
      where: { id: parsed.data.recipientId },
      select: { id: true, name: true },
    });
    if (!recipient) {
      return NextResponse.json(
        { success: false, error: "Recipient not found" },
        { status: 404 }
      );
    }

    const message = await db.message.create({
      data: {
        senderId: auth.userId,
        recipientId: parsed.data.recipientId,
        subject: parsed.data.subject || null,
        body: parsed.data.body,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        recipient: { select: { id: true, name: true, role: true } },
      },
    });

    // Create notification for recipient
    await db.notification.create({
      data: {
        userId: parsed.data.recipientId,
        type: "NEW_MESSAGE",
        title: `New message from ${auth.role === "CLIENT" ? "client" : "dietitian"}`,
        body: parsed.data.body.slice(0, 100),
        link: auth.role === "CLIENT" ? "/admin/messages" : "/dashboard/messages",
      },
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
