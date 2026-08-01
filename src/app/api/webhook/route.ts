import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";

// Force Node.js runtime (uses node:crypto + node:child_process).
export const runtime = "nodejs";
// Never cache / statically render this endpoint.
export const dynamic = "force-dynamic";

/**
 * POST /api/webhook
 * GitHub webhook receiver — auto-deploys on push to main.
 *
 * Setup:
 * 1. In GitHub repo → Settings → Webhooks → Add webhook
 * 2. Payload URL: https://thedietitiansclinic.com/api/webhook
 * 3. Content type: application/json
 * 4. Secret: Set WEBHOOK_SECRET env var on the VPS to the same value
 * 5. Events: Just the "push" event
 *
 * SECURITY: WEBHOOK_SECRET has NO default. If unset, the endpoint 503s
 * instead of accepting forged requests with a known-default secret.
 */

function getWebhookSecret(): string {
  const s = process.env.WEBHOOK_SECRET;
  if (!s) {
    throw new Error("WEBHOOK_SECRET is not set — refusing to process webhook.");
  }
  if (s.length < 16) {
    throw new Error("WEBHOOK_SECRET must be at least 16 characters.");
  }
  return s;
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
  // Constant-time comparison.
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Spawns the deploy pipeline as a detached background shell process so the
 * webhook can respond to GitHub immediately. A full build takes much longer
 * than GitHub's ~10s webhook delivery timeout, so we must not block on it.
 *
 * SECURITY: User-controlled values (pushedBy, commitMsg) are passed via
 * environment variables — never interpolated into the shell script — to
 * prevent command injection (CWE-78).
 */
function startBackgroundDeploy(pushedBy: string, commitMsg: string): void {
  const deployScript = [
    "set -e",
    'echo "======== Deploy started at $(date) ========"',
    'echo "Triggered by: $DEPLOY_PUSHED_BY — $DEPLOY_COMMIT_MSG"',
    "cd /opt/dietitians-clinic",
    "git config pull.rebase false",
    "git stash || true",
    "git pull origin main --no-rebase",
    "git stash pop || true",
    "bun install --frozen-lockfile",
    "npx prisma generate",
    "npx prisma db push",
    "NEXT_TELEMETRY_DISABLED=1 bun run build",
    "cp -r .next/static .next/standalone/.next/",
    "cp -r public .next/standalone/",
    "systemctl restart dietitians-clinic",
    'echo "======== Deploy complete at $(date) ========"',
  ].join("\n");

  const logStream = createWriteStream("/opt/dietitians-clinic/deploy.log", { flags: "a" });

  const child = spawn("bash", ["-c", deployScript], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      // Truncate to prevent env var buffer overflow attempts
      DEPLOY_PUSHED_BY: pushedBy.slice(0, 200),
      DEPLOY_COMMIT_MSG: commitMsg.slice(0, 500),
    },
  });

  // Pipe output to deploy.log for debugging.
  child.stdout?.pipe(logStream);
  child.stderr?.pipe(logStream);

  // Detach so the process survives after the request handler returns.
  child.unref();

  child.on("error", (err) => {
    console.error("❌ Failed to spawn deploy process:", err);
  });
}

export async function POST(req: NextRequest) {
  let secret: string;
  try {
    secret = getWebhookSecret();
  } catch (err) {
    console.error("❌ Webhook misconfigured:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: "Webhook not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("x-hub-signature-256") || "";
    const event = req.headers.get("x-github-event") || "";

    // Verify webhook signature
    if (!verifySignature(body, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Only handle push events
    if (event !== "push") {
      return NextResponse.json({ message: "Ignored: not a push event" });
    }

    let payload: { ref?: string; head_commit?: { message?: string }; pusher?: { name?: string } };
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    const ref = payload.ref;

    // Only deploy on pushes to main
    if (ref !== "refs/heads/main") {
      return NextResponse.json({ message: "Ignored: not main branch" });
    }

    const commitMsg = payload.head_commit?.message || "Unknown commit";
    const pushedBy = payload.pusher?.name || "Unknown";

    console.log(`🔄 Auto-deploy triggered by ${pushedBy}: ${commitMsg}`);

    // Kick off the deploy in the background and respond immediately (HTTP 202
    // Accepted). GitHub would otherwise time out the delivery.
    startBackgroundDeploy(pushedBy, commitMsg);

    return NextResponse.json(
      { success: true, message: "Deploy started" },
      { status: 202 }
    );
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "GitHub Webhook Auto-Deploy",
    status: process.env.WEBHOOK_SECRET ? "active" : "misconfigured",
    message: "Send POST requests from GitHub webhooks to trigger deployment",
  });
}