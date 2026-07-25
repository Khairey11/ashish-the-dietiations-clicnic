"use client";

import * as React from "react";
import { GitBranch, GitCommit, RefreshCw, ExternalLink, Check, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CommitInfo = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

type GithubStatus = {
  enabled: boolean;
  repo: string;
  lastKnownSha: string;
  lastCheckAt: string;
  hasUpdates: boolean;
  unreadCount: number;
  latestCommit: CommitInfo | null;
  recentCommits?: CommitInfo[];
  error?: string;
};

/**
 * GithubUpdateChecker
 *
 * A self-contained widget that polls /api/admin/github-status every 60 seconds
 * to check if there are new commits in the connected GitHub repo.
 *
 * Shows:
 *   - Green dot when up-to-date
 *   - Amber dot + count when there are new commits
 *   - Click to expand recent commits list
 *   - Toggle to enable/disable polling
 */
export function GithubUpdateChecker() {
  const [status, setStatus] = React.useState<GithubStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);
  const [toggling, setToggling] = React.useState(false);

  const check = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/github-status");
      const data = await res.json();
      if (data.success) {
        const prevStatus = status;
        setStatus(data.data);

        // Show toast when new commits detected (but not on first load)
        if (prevStatus && data.data.hasUpdates && data.data.unreadCount > 0 && !prevStatus.hasUpdates) {
          toast.info("New code update!", {
            description: `${data.data.unreadCount} new commit${data.data.unreadCount > 1 ? "s" : ""} pushed to GitHub`,
          });
        }
      }
    } catch {
      // Silent fail — don't spam toasts on network errors
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Initial check
  React.useEffect(() => {
    void check();
  }, [check]);

  // Poll every 60 seconds
  React.useEffect(() => {
    if (!status || !status.enabled) return;

    const interval = setInterval(() => {
      void check();
    }, 60_000); // 60 seconds

    return () => clearInterval(interval);
  }, [status?.enabled, check]);

  const toggle = async () => {
    setToggling(true);
    try {
      const res = await fetch("/api/admin/github-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !status?.enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus((prev) => prev ? { ...prev, enabled: data.enabled } : prev);
        toast.success(data.enabled ? "Update checker on" : "Update checker off");
      }
    } catch {
      toast.error("Failed to toggle");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 rounded-2xl border border-border/40 bg-card animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-2" />
        <div className="h-3 w-48 bg-muted rounded" />
      </div>
    );
  }

  if (!status) return null;

  const fmtTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className={cn(
      "rounded-2xl border bg-card overflow-hidden transition-all",
      status.hasUpdates ? "border-amber-500/40" : "border-border/40",
    )}>
      {/* Header row */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-3 text-left"
        >
          <div className="relative">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              !status.enabled
                ? "bg-muted"
                : status.hasUpdates
                  ? "bg-amber-500/15"
                  : "bg-emerald-500/15"
            )}>
              {status.enabled ? (
                <GitBranch className={cn(
                  "w-4 h-4",
                  status.hasUpdates ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                )} />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            {status.enabled && status.hasUpdates && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                {status.unreadCount}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold flex items-center gap-1.5">
              GitHub Updates
              {!status.enabled && (
                <span className="text-[10px] text-muted-foreground font-normal">(disabled)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {status.error ? (
                <span className="text-rose-500">{status.error}</span>
              ) : status.enabled && status.hasUpdates ? (
                <span className="text-amber-600 dark:text-amber-400">
                  {status.unreadCount} new commit{status.unreadCount > 1 ? "s" : ""}
                </span>
              ) : status.enabled && status.latestCommit ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" />
                  All caught up · last check {fmtTime(status.lastCheckAt)}
                </span>
              ) : status.enabled ? (
                "Checking for updates..."
              ) : (
                "Polling is turned off"
              )}
            </p>
          </div>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => void check()}
            className="w-8 h-8 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors"
            title="Check now"
            disabled={!status.enabled}
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", loading && "animate-spin")} />
          </button>
          <ToggleSwitch checked={status.enabled} onChange={toggle} disabled={toggling} />
        </div>
      </div>

      {/* Expanded: recent commits */}
      {expanded && status.enabled && status.recentCommits && status.recentCommits.length > 0 && (
        <div className="border-t border-border/40 p-3 space-y-2">
          {status.recentCommits.map((c) => (
            <a
              key={c.sha}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors text-left group"
            >
              <GitCommit className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{c.message}</p>
                <p className="text-[10px] text-muted-foreground">
                  <code className="font-mono">{c.sha}</code> · {c.author} · {fmtTime(c.date)}
                </p>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/** Small toggle switch component */
function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0",
        checked ? "bg-primary" : "bg-muted",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      role="switch"
      aria-checked={checked}
      title={checked ? "Turn off update checker" : "Turn on update checker"}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-4.5" : "translate-x-1"
        )}
        style={checked ? { transform: "translateX(18px)" } : { transform: "translateX(4px)" }}
      />
    </button>
  );
}