"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail, ChevronLeft, Download, Search, CheckCircle2, XCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  source: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
};

const filters = ["ALL", "ACTIVE", "INACTIVE"] as const;
type Filter = (typeof filters)[number];

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("ALL");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ active: filter });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/newsletter?${params}`);
      const data = await res.json();
      if (data.success) setSubscribers(data.data);
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch]);

  React.useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/newsletter?format=csv");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Exported", { description: "CSV file downloaded." });
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">Newsletter</h1>
                  <Badge className="bg-primary/15 text-primary border-0">
                    {activeCount} active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage email subscribers and export for campaigns.
                </p>
              </div>
            </div>
            <Button onClick={exportCsv} disabled={exporting || subscribers.length === 0} variant="outline">
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export CSV
            </Button>
          </div>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email..."
                className="pl-9 h-11"
                aria-label="Search subscribers"
              />
            </div>
            <div className="flex gap-2">
              {filters.map((f) => (
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
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Mail className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-semibold">No subscribers found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Newsletter signups from the footer will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Name</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Source</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Subscribed</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-medium">{s.email}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell text-muted-foreground">
                          {s.name || "—"}
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell">
                          <Badge variant="outline" className="text-[10px]">{s.source}</Badge>
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell text-muted-foreground">
                          {fmtDate(s.subscribedAt)}
                        </TableCell>
                        <TableCell>
                          {s.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-muted text-muted-foreground">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
  );
}
