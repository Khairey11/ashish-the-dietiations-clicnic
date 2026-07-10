"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, FileText, Eye, EyeOff, Star, Trash2, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  publishedAt: string | null;
  createdAt: string;
};

const filters = ["ALL", "PUBLISHED", "DRAFT", "FEATURED"] as const;

export default function AdminBlogPage() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<(typeof filters)[number]>("ALL");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog?status=${filter}`);
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const deletePost = async (id: string) => {
    if (!confirm("Delete this blog post? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Post deleted");
      } else {
        toast.error("Delete failed", { description: data.error });
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const fmtDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Blog CMS</h1>
            <Badge className="bg-primary/15 text-primary border-0">{filter}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Create, edit, and publish articles for the clinic blog.
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
            <Plus className="w-4 h-4 mr-1.5" />
            New article
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
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
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-semibold">No {filter === "ALL" ? "" : filter.toLowerCase()} articles</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Create your first blog post to share nutrition insights with your clients.
            </p>
            <Link href="/admin/blog/new">
              <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="w-4 h-4 mr-1.5" />
                Write first article
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Slug</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Published</TableHead>
                  <TableHead className="text-xs text-center">Views</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs">
                      <Link href={`/admin/blog/${p.id}`} className="font-semibold hover:text-primary transition-colors">
                        {p.title}
                      </Link>
                      {p.isFeatured && (
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline ml-1" />
                      )}
                    </TableCell>
                    <TableCell className="text-xs hidden sm:table-cell font-mono text-muted-foreground">
                      /{p.slug}
                    </TableCell>
                    <TableCell className="text-xs hidden md:table-cell text-muted-foreground">
                      {fmtDate(p.publishedAt)}
                    </TableCell>
                    <TableCell className="text-xs text-center font-semibold">{p.views}</TableCell>
                    <TableCell>
                      {p.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <Eye className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          <EyeOff className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/admin/blog/${p.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Edit</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePost(p.id)}
                          disabled={deletingId === p.id}
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                        >
                          {deletingId === p.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
