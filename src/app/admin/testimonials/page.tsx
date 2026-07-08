"use client";

import * as React from "react";
import Link from "next/link";
import {
  Star, ChevronLeft, CheckCircle2, XCircle, Sparkles, Trash2,
  Loader2, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Testimonial = {
  id: string;
  name: string;
  age: number | null;
  city: string | null;
  condition: string;
  duration: string | null;
  quote: string;
  highlight: string;
  rating: number;
  initials: string;
  accent: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
};

const statusFilters = ["PENDING", "APPROVED", "ALL"] as const;
type StatusFilter = (typeof statusFilters)[number];

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<StatusFilter>("PENDING");
  const [actingId, setActingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials?status=${filter}`);
      const data = await res.json();
      if (data.success) setTestimonials(data.data);
    } catch {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: "approve" | "unapprove" | "feature" | "unfeature" | "delete") => {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === "delete") {
          setTestimonials((prev) => prev.filter((t) => t.id !== id));
          toast.success("Testimonial deleted");
        } else {
          setTestimonials((prev) =>
            prev.map((t) => {
              if (t.id !== id) return t;
              if (action === "approve") return { ...t, isApproved: true };
              if (action === "unapprove") return { ...t, isApproved: false };
              if (action === "feature") return { ...t, isFeatured: true };
              if (action === "unfeature") return { ...t, isFeatured: false };
              return t;
            })
          );
          toast.success(`Testimonial ${action}d`);
        }
      } else {
        toast.error("Action failed", { description: data.error });
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setActingId(null);
    }
  };

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
                  <h1 className="text-2xl sm:text-3xl font-bold">Testimonials</h1>
                  <Badge className="bg-primary/15 text-primary border-0">{filter}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Review and approve client-submitted testimonials.
                </p>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  filter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/60 hover:bg-muted/60"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold">No {filter.toLowerCase()} testimonials</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filter === "PENDING"
                  ? "New submissions from the website will appear here for review."
                  : "Try a different filter."}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "rounded-2xl border bg-card p-5",
                    t.isApproved ? "border-border/40" : "border-amber-500/40 ring-1 ring-amber-500/10"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold", t.accent)}>
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.age ? `${t.age} yrs · ` : ""}
                          {t.city || "Nepal"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3 h-3",
                            i < t.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{t.condition}</Badge>
                    {t.duration && (
                      <Badge variant="outline" className="text-[10px]">{t.duration}</Badge>
                    )}
                    {t.isFeatured && (
                      <Badge className="text-[10px] bg-violet-500/15 text-violet-600 dark:text-violet-400 border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {!t.isApproved && (
                      <Badge className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0">
                        Pending
                      </Badge>
                    )}
                  </div>

                  {/* Quote */}
                  <div className="mb-3">
                    <Quote className="w-4 h-4 text-muted-foreground/40 mb-1" />
                    <p className="text-sm text-foreground/85 leading-relaxed line-clamp-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  {/* Meta */}
                  <p className="text-[10px] text-muted-foreground mb-4">
                    Submitted {fmtDate(t.createdAt)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!t.isApproved ? (
                      <Button
                        size="sm"
                        onClick={() => act(t.id, "approve")}
                        disabled={actingId === t.id}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                      >
                        {actingId === t.id ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        Approve
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => act(t.id, "unapprove")}
                        disabled={actingId === t.id}
                        className="h-7 text-xs"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Unapprove
                      </Button>
                    )}
                    {t.isApproved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => act(t.id, t.isFeatured ? "unfeature" : "feature")}
                        disabled={actingId === t.id}
                        className="h-7 text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t.isFeatured ? "Unfeature" : "Feature"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => act(t.id, "delete")}
                      disabled={actingId === t.id}
                      className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
  );
}
