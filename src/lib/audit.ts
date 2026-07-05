import { db } from "@/lib/db";

/**
 * Write an audit log entry for admin actions.
 * Captures who did what, on which entity, with before/after state.
 */
export async function writeAuditLog(opts: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: opts.userId,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId || null,
        before: opts.before ? JSON.stringify(opts.before) : null,
        after: opts.after ? JSON.stringify(opts.after) : null,
        ipAddress: opts.ipAddress || null,
      },
    });
  } catch (error) {
    // Audit log failure should never break the main operation
    console.error("Failed to write audit log:", error);
  }
}

/**
 * Serialize a Prisma model instance to a plain object for audit logging.
 */
export function serializeForAudit(obj: unknown): Record<string, unknown> | null {
  if (!obj || typeof obj !== "object") return null;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return null;
  }
}
