/**
 * Data retention cleanup script.
 *
 * Deletes records that have exceeded their retention period, per the privacy
 * policy at /privacy:
 *   - AuditLog:     retained for 1 year
 *   - ActivityLog:  retained for 1 year
 *   - VerificationToken: retained until expiry (24h)
 *   - PasswordReset:     retained until expiry + 7 days
 *
 * Payment records are retained for 7 years (tax law) — NOT touched here.
 * Client records are retained for program duration + 7 years — NOT touched here.
 *
 * Run manually:
 *   bun run scripts/retention-cleanup.ts
 *
 * Cron (weekly, Sunday 3:00 AM):
 *   0 3 * * 0 cd /opt/dietitians-clinic && bun run scripts/retention-cleanup.ts >> /var/log/dietitians-retention.log 2>&1
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RETENTION_DAYS = {
  auditLog: 365,
  activityLog: 365,
  verificationToken: 1,   // 24h
  passwordReset: 7,       // 7 days after creation (tokens are already expired/used)
};

async function main() {
  const now = new Date();
  console.log(`🧹 Retention cleanup starting at ${now.toISOString()}`);

  // ----- AuditLog -----
  const auditCutoff = new Date(now.getTime() - RETENTION_DAYS.auditLog * 24 * 60 * 60 * 1000);
  const auditDeleted = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: auditCutoff } },
  });
  console.log(`   AuditLog: deleted ${auditDeleted.count} records older than ${RETENTION_DAYS.auditLog} days`);

  // ----- ActivityLog -----
  const activityCutoff = new Date(now.getTime() - RETENTION_DAYS.activityLog * 24 * 60 * 60 * 1000);
  const activityDeleted = await prisma.activityLog.deleteMany({
    where: { createdAt: { lt: activityCutoff } },
  });
  console.log(`   ActivityLog: deleted ${activityDeleted.count} records older than ${RETENTION_DAYS.activityLog} days`);

  // ----- VerificationToken -----
  const tokenCutoff = new Date(now.getTime() - RETENTION_DAYS.verificationToken * 24 * 60 * 60 * 1000);
  const tokensDeleted = await prisma.verificationToken.deleteMany({
    where: { expires: { lt: tokenCutoff } },
  });
  console.log(`   VerificationToken: deleted ${tokensDeleted.count} expired tokens`);

  // ----- PasswordReset -----
  // PasswordReset has no createdAt — use expiresAt. Tokens that expired
  // more than RETENTION_DAYS.passwordReset ago are safe to delete.
  const resetCutoff = new Date(now.getTime() - RETENTION_DAYS.passwordReset * 24 * 60 * 60 * 1000);
  const resetsDeleted = await prisma.passwordReset.deleteMany({
    where: { expiresAt: { lt: resetCutoff } },
  });
  console.log(`   PasswordReset: deleted ${resetsDeleted.count} records expired more than ${RETENTION_DAYS.passwordReset} days ago`);

  console.log(`✅ Retention cleanup complete.`);
}

main()
  .catch((e) => {
    console.error("❌ Retention cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
