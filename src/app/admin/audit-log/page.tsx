"use client";

import * as React from "react";
import Link from "next/link";
import { ScrollText, ChevronLeft, Loader2 } from "lucide-react";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AuditEntry = {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  before: string | null;
  after: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
};

const entityFilters = ["ALL", "Lead", "Payment", "Testimonial", "Appointment", "SiteSetting"];
const actionColors: Record<string, string> = {
  LEAD_UPDATED: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  PAYMENT_VERIFIED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  TESTIMONIAL_APPROVED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  TESTIMONIAL_REJECTED: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  APPOINTMENT_UPDATED: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
};

export default function AdminAuditLogPage() {
  const [entries, setEntries] = React.useState<AuditEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("ALL");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = filter === "ALL" ? "" : `?entity=${filter}`;
      const res = await fetch(`/api/admin/audit-log${qs}`);
      const data = await res.json();
      if (data.success) setEntries(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const fmtDateTime = (s: string) => {
    const d = new Date(s);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
  };

  const parseJson = (s: string | null): Record<string, unknown> | null => {
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      <main id="main" className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Audit Log</h1>
                <Badge className="bg-primary/15 text-primary border-0">{entries.length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Every admin action is recorded here for accountability.
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {entityFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/60 hover:bg-muted/60"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-16 px-4">
                <ScrollText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-semibold">No audit entries yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Admin actions (lead updates, payment verifications) will be logged here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">When</TableHead>
                      <TableHead className="text-xs">Action</TableHead>
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Entity</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">IP</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((e) => {
                      const dt = fmtDateTime(e.createdAt);
                      const before = parseJson(e.before);
                      const after = parseJson(e.after);
                      const changedField =
                        after && !before
                          ? "created"
                          : after && before
                          ? Object.keys(after).find((k) => JSON.stringify((before as Record<string, unknown>)[k]) !== JSON.stringify(after[k])) || "updated"
                          : "—";
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="text-xs">
                            <div className="font-mono font-semibold">{dt.date}</div>
                            <div className="text-muted-foreground">{dt.time}</div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md",
                                actionColors[e.action] || "bg-muted text-muted-foreground"
                              )}
                            >
                              {e.action.replace(/_/g, " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="font-medium">{e.user?.name || "System"}</div>
                            <div className="text-muted-foreground">{e.user?.email || "—"}</div>
                          </TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">
                            <div className="font-medium">{e.entity}</div>
                            {e.entityId && (
                              <div className="text-muted-foreground font-mono text-[10px]">
                                {e.entityId.slice(-8)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell font-mono text-muted-foreground">
                            {e.ipAddress || "—"}
                          </TableCell>
                          <TableCell className="text-xs hidden lg:table-cell text-muted-foreground">
                            {changedField}
                            {after && after[changedField] !== undefined && (
                              <span className="ml-1 font-medium text-foreground">
                                → {String(after[changedField])}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
