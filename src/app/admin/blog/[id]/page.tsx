"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [form, setForm] = React.useState<any>(null);

  React.useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  React.useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/blog/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setForm({
            title: d.data.title,
            slug: d.data.slug,
            excerpt: d.data.excerpt,
            content: d.data.content,
            tags: d.data.tags ? JSON.parse(d.data.tags).join(", ") : "",
            coverAccent: d.data.coverAccent || "from-primary to-secondary",
            readingTime: d.data.readingTime || 5,
            isPublished: d.data.isPublished,
            isFeatured: d.data.isFeatured,
          });
        } else {
          toast.error("Post not found");
          router.push("/admin/blog");
        }
      })
      .catch(() => toast.error("Failed to load post"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const update = (k: string, v: string | number | boolean) =>
    setForm((p: any) => ({ ...p, [k]: v }));

  const save = async (publish = false) => {
    if (publish) setPublishing(true);
    else setSaving(true);
    try {
      const payload = {
        ...form,
        tags: JSON.stringify(form.tags.split(",").map((t: string) => t.trim()).filter(Boolean)),
        isPublished: publish || form.isPublished,
      };
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(publish ? "Published!" : "Saved", {
          description: `"${form.title}" has been ${publish ? "published" : "updated"}.`,
        });
        if (publish) {
          setForm((p: any) => ({ ...p, isPublished: true }));
        }
      } else {
        toast.error("Save failed", { description: data.error });
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const deletePost = async () => {
    if (!confirm("Delete this blog post? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Post deleted");
        router.push("/admin/blog");
        router.refresh();
      } else {
        toast.error("Delete failed", { description: data.error });
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !form) {
    return (
      <>
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Article</h1>
            <p className="text-xs text-muted-foreground mt-1">{form.isPublished ? "Published" : "Draft"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={deletePost} disabled={deleting} className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10">
            {deleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
            Delete
          </Button>
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={saving || publishing}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
          {!form.isPublished && (
            <Button size="sm" onClick={() => save(true)} disabled={saving || publishing} className="bg-gradient-to-r from-primary to-secondary">
              {publishing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
              Publish
            </Button>
          )}
          {form.isPublished && (
            <Button size="sm" variant="outline" onClick={() => { update("isPublished", false); save(false); }} disabled={saving || publishing}>
              <EyeOff className="w-4 h-4 mr-1" />
              Unpublish
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="h-11 text-base font-semibold"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">URL slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">/blog/</span>
              <Input
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Excerpt *</Label>
            <Textarea
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Content *</Label>
            <Textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              rows={20}
              className="font-mono text-sm resize-y"
            />
            <p className="text-[10px] text-muted-foreground">{form.content.length} characters</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-border/40 bg-card space-y-3">
            <h3 className="text-sm font-semibold">Status</h3>
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
              form.isPublished
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            )}>
              {form.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {form.isPublished ? "Published" : "Draft"}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => update("isFeatured", !form.isFeatured)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1",
                  form.isFeatured
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-muted/60 text-muted-foreground"
                )}
              >
                <span className={cn("w-3 h-3", form.isFeatured ? "fill-amber-400 text-amber-400" : "")}>★</span>
                {form.isFeatured ? "Featured" : "Not featured"}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border/40 bg-card space-y-3">
            <h3 className="text-sm font-semibold">Article meta</h3>
            <div className="space-y-1.5">
              <Label className="text-xs">Reading time (min)</Label>
              <Input
                type="number"
                value={form.readingTime}
                onChange={(e) => update("readingTime", parseInt(e.target.value) || 5)}
                min={1}
                max={60}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Cover gradient</Label>
              <select
                value={form.coverAccent}
                onChange={(e) => update("coverAccent", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
              >
                <option value="from-primary to-secondary">Blue → Indigo (brand)</option>
                <option value="from-emerald-500 to-teal-500">Emerald → Teal</option>
                <option value="from-emerald-500 to-teal-500">Sky → Blue</option>
                <option value="from-amber-500 to-orange-500">Amber → Orange</option>
                <option value="from-violet-500 to-purple-500">Violet → Purple</option>
                <option value="from-rose-500 to-pink-500">Rose → Pink</option>
              </select>
              <div className={cn("h-12 rounded-lg bg-gradient-to-br", form.coverAccent)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
