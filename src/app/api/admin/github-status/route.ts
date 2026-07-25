import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

/**
 * GET /api/admin/github-status
 *
 * Checks the connected GitHub repository for new commits since the last
 * known commit SHA. Returns whether polling is enabled, the latest commit
 * info, and whether there are updates.
 *
 * The repo URL is derived from the git remote (set via GITHUB_REPO env var
 * in the format "owner/repo", e.g. "Khairey11/ashish-the-dietiations-clicnic").
 *
 * This is a "pull" model — the admin dashboard client polls this endpoint
 * every 60 seconds when the tab is open. No server-side cron needed.
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    // Check if polling is enabled
    const enabledSetting = await db.siteSetting.findUnique({
      where: { key: "github_polling_enabled" },
    });
    const isEnabled = enabledSetting?.value !== "false"; // default: enabled

    // Get the repo identifier from env
    const repo = process.env.GITHUB_REPO || "Khairey11/ashish-the-dietiations-clicnic";

    // Get the last known commit SHA from DB
    const lastKnownSetting = await db.siteSetting.findUnique({
      where: { key: "github_last_known_sha" },
    });
    const lastKnownSha = lastKnownSetting?.value || "";

    // Get the last check timestamp
    const lastCheckSetting = await db.siteSetting.findUnique({
      where: { key: "github_last_check_at" },
    });
    const lastCheckAt = lastCheckSetting?.value || "";

    if (!isEnabled) {
      return NextResponse.json({
        success: true,
        data: {
          enabled: false,
          repo,
          lastKnownSha,
          lastCheckAt,
          hasUpdates: false,
          latestCommit: null,
        },
      });
    }

    // Fetch latest commit from GitHub API
    // Use the public GitHub API (no auth needed for public repos, but rate-limited to 60/hr)
    // For private repos, set GITHUB_TOKEN env var.
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${repo}/commits?per_page=5`,
      {
        headers,
        // Revalidate every 60 seconds
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      // GitHub API error — return gracefully without crashing
      return NextResponse.json({
        success: true,
        data: {
          enabled: true,
          repo,
          lastKnownSha,
          lastCheckAt,
          hasUpdates: false,
          latestCommit: null,
          error: `GitHub API returned ${res.status}`,
        },
      });
    }

    const commits = await res.json();
    if (!Array.isArray(commits) || commits.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          enabled: true,
          repo,
          lastKnownSha,
          lastCheckAt,
          hasUpdates: false,
          latestCommit: null,
        },
      });
    }

    const latestCommit = commits[0];
    const latestSha = latestCommit.sha;
    const now = new Date().toISOString();

    // Determine if there are updates by comparing SHA
    const hasUpdates = lastKnownSha !== "" && lastKnownSha !== latestSha;

    // Update the last known SHA and check time in DB
    await db.$transaction([
      db.siteSetting.upsert({
        where: { key: "github_last_known_sha" },
        update: { value: latestSha },
        create: { key: "github_last_known_sha", value: latestSha },
      }),
      db.siteSetting.upsert({
        where: { key: "github_last_check_at" },
        update: { value: now },
        create: { key: "github_last_check_at", value: now },
      }),
    ]);

    // Get unread commits count (commits newer than lastKnownSha)
    let unreadCount = 0;
    if (hasUpdates && lastKnownSha) {
      unreadCount = commits.filter((c: { sha: string }) => c.sha !== lastKnownSha).length;
    } else if (!lastKnownSha) {
      // First check — count all as unread
      unreadCount = commits.length;
    }

    return NextResponse.json({
      success: true,
      data: {
        enabled: true,
        repo,
        lastKnownSha: latestSha,
        lastCheckAt: now,
        hasUpdates: unreadCount > 0,
        unreadCount,
        latestCommit: {
          sha: latestSha.substring(0, 7),
          message: latestCommit.commit?.message?.split("\n")[0] || "",
          author: latestCommit.commit?.author?.name || "",
          date: latestCommit.commit?.author?.date || "",
          url: latestCommit.html_url || `https://github.com/${repo}/commit/${latestSha}`,
        },
        recentCommits: commits.slice(0, 5).map((c: {
          sha: string;
          commit: { message?: string; author?: { name?: string; date?: string } };
          html_url?: string;
        }) => ({
          sha: c.sha.substring(0, 7),
          message: c.commit?.message?.split("\n")[0] || "",
          author: c.commit?.author?.name || "",
          date: c.commit?.author?.date || "",
          url: c.html_url || `https://github.com/${repo}/commit/${c.sha}`,
        })),
      },
    });
  } catch (error) {
    console.error("GitHub status check failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check GitHub status" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/github-status
 * Toggle the GitHub polling feature on/off.
 * Body: { enabled: boolean }
 */
export async function PUT(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const enabled = Boolean(body.enabled);

    await db.siteSetting.upsert({
      where: { key: "github_polling_enabled" },
      update: { value: String(enabled) },
      create: { key: "github_polling_enabled", value: String(enabled) },
    });

    await writeAuditLog({
      userId: auth.userId,
      action: "GITHUB_POLLING_TOGGLED",
      entity: "SiteSetting",
      after: { enabled },
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
    });

    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error("Failed to toggle GitHub polling:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update setting" },
      { status: 500 }
    );
  }
}