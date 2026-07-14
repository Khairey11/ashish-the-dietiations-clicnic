import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { execSync } from "node:child_process";

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
 */

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "dietitians-webhook-secret";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
  return signature === expected;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-hub-signature-256") || "";
    const event = req.headers.get("x-github-event") || "";

    // Verify webhook signature
    if (!verifySignature(body, signature, WEBHOOK_SECRET)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Only handle push events
    if (event !== "push") {
      return NextResponse.json({ message: "Ignored: not a push event" });
    }

    const payload = JSON.parse(body);
    const ref = payload.ref;

    // Only deploy on pushes to main
    if (ref !== "refs/heads/main") {
      return NextResponse.json({ message: "Ignored: not main branch" });
    }

    const commitMsg = payload.head_commit?.message || "Unknown commit";
    const pushedBy = payload.pusher?.name || "Unknown";

    console.log(`🔄 Auto-deploy triggered by ${pushedBy}: ${commitMsg}`);

    // Run deploy commands synchronously
    const commands = [
      "cd /opt/dietitians-clinic",
      "git pull origin main",
      "bun install --frozen-lockfile",
      "npx prisma generate",
      "npx prisma db push",
      "NEXT_TELEMETRY_DISABLED=1 bun run build",
      "cp -r .next/static .next/standalone/.next/",
      "cp -r public .next/standalone/",
      "systemctl restart dietitians-clinic",
    ];

    const deployCmd = commands.join(" && ");
    const output = execSync(deployCmd, {
      timeout: 300000, // 5 minute timeout
      encoding: "utf-8",
      stdio: "pipe",
    });

    console.log("✅ Auto-deploy complete:", output.slice(-200));

    return NextResponse.json({
      success: true,
      message: "Deployed successfully",
      commit: commitMsg,
      pushedBy,
    });
  } catch (error) {
    console.error("❌ Auto-deploy failed:", error);
    return NextResponse.json(
      { success: false, error: "Deploy failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "GitHub Webhook Auto-Deploy",
    status: "active",
    message: "Send POST requests from GitHub webhooks to trigger deployment",
  });
}
