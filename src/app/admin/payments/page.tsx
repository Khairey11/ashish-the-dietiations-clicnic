"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard, CheckCircle2, Clock, XCircle, Loader2, ChevronLeft,
  Search, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  txnRef: string | null;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string | null; email: string; phone: string | null } | null;
  program: { id: string; duration: string; tagline: string } | null;
};

const statusFilters = ["ALL", "PENDING", "PAID", "FAILED"] as const;
type StatusFilter = (typeof statusFilters)[number];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = React.useState<PaymentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<StatusFilter>("PENDING");
  const [verifyingId, setVerifyingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = filter === "ALL" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/payments${qs}`);
      const data = await res.json();
      if (data.success) setPayments(data.data);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const verifyPayment = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment verified", {
          description: "Marked as PAID. Client has been notified.",
        });
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "PAID" } : p))
        );
      } else {
        toast.error("Verification failed", { description: data.error });
      }
    } catch {
      toast.error("Verification failed", { description: "Network error" });
    } finally {
      setVerifyingId(null);
    }
  };

  const fmtNPR = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;
  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
                  <h1 className="text-2xl sm:text-3xl font-bold">Payments</h1>
                  <Badge className="bg-primary/15 text-primary border-0">
                    {filter === "ALL" ? "All" : filter}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Verify pending WhatsApp-proof payments and review transaction history.
                </p>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                  filter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/60 hover:bg-muted/60"
                )}
              >
                {s === "PENDING" && <Clock className="w-3 h-3 inline mr-1" />}
                {s === "PAID" && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {s === "FAILED" && <XCircle className="w-3 h-3 inline mr-1" />}
                {s === "ALL" && <CreditCard className="w-3 h-3 inline mr-1" />}
                {s}
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
            ) : payments.length === 0 ? (
              <div className="text-center py-16 px-4">
                <CreditCard className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-semibold">No {filter === "ALL" ? "" : filter.toLowerCase()} payments</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filter === "PENDING"
                    ? "When clients send payment screenshots via WhatsApp, they'll appear here for verification."
                    : "Try a different filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Program</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Method</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs">
                          <div className="font-semibold">{p.client?.name || "—"}</div>
                          <div className="text-muted-foreground">{p.client?.email}</div>
                          {p.client?.phone && (
                            <div className="text-muted-foreground">{p.client.phone}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">
                          {p.program ? (
                            <>
                              <div className="font-medium">{p.program.duration}</div>
                              <div className="text-muted-foreground">{p.program.tagline}</div>
                            </>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {fmtNPR(p.amount)}
                          <div className="text-[10px] text-muted-foreground font-normal">{p.currency}</div>
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell">
                          <Badge variant="outline" className="text-[10px]">
                            {p.method}
                          </Badge>
                          {p.txnRef && (
                            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                              {p.txnRef.slice(0, 20)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell text-muted-foreground">
                          {fmtDate(p.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md",
                              p.status === "PAID" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                              p.status === "PENDING" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                              p.status === "FAILED" && "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                              p.status === "REFUNDED" && "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                            )}
                          >
                            {p.status === "PAID" && <CheckCircle2 className="w-3 h-3" />}
                            {p.status === "PENDING" && <Clock className="w-3 h-3" />}
                            {p.status === "FAILED" && <XCircle className="w-3 h-3" />}
                            {p.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {p.status === "PENDING" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => verifyPayment(p.id)}
                              disabled={verifyingId === p.id}
                              className="h-7 text-xs"
                            >
                              {verifyingId === p.id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              )}
                              Mark paid
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Help note */}
          <div className="mt-6 p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 flex items-start gap-3">
            <Search className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-foreground/80 leading-relaxed">
              <p className="font-semibold mb-1">How verification works</p>
              <p>
                When a client books, a PENDING payment is created. The client sends a payment
                screenshot via WhatsApp. Cross-check the screenshot against the client's name and
                amount above, then click "Mark paid" to confirm. Live Khalti/eSewa payments are
                auto-verified and won't appear as PENDING.
              </p>
            </div>
          </div>
        </div>
  );
}
