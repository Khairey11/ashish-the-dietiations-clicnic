"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    coverAccent: "from-primary to-secondary",
    readingTime: 5,
    isPublished: false,
    isFeatured: false,
  });

  const update = (k: string, v: string | number | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const save = async (publish = false) => {
    if (publish) setPublishing(true);
    else setSaving(true);
    try {
      const payload = { ...form, isPublished: publish || form.isPublished };
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(publish ? "Published!" : "Draft saved", {
          description: `"${form.title}" is now ${publish ? "live" : "a draft"}.`,
        });
        router.push("/admin/blog");
        router.refresh();
      } else {
        toast.error("Save failed", { description: data.error });
      }
    } catch {
      toast.error("Save failed", { description: "Network error" });
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold">New Article</h1>
            <p className="text-xs text-muted-foreground mt-1">Write a new blog post for the clinic.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={saving || publishing || !form.title || !form.content}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save draft
          </Button>
          <Button size="sm" onClick={() => save(true)} disabled={saving || publishing || !form.title || !form.content} className="bg-gradient-to-r from-primary to-secondary">
            {publishing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
            Publish
          </Button>
        </div>
      </div>

      <BlogEditor form={form} update={update} autoSlug={autoSlug} />
    </>
  );
}

export function BlogEditor({
  form,
  update,
  autoSlug,
}: {
  form: any;
  update: (k: string, v: string | number | boolean) => void;
  autoSlug: (title: string) => string;
}) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main editor */}
      <div className="lg:col-span-2 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => {
              update("title", e.target.value);
              if (!form.slug || form.slug === autoSlug(form.title)) {
                update("slug", autoSlug(e.target.value));
              }
            }}
            placeholder="The truth about carbs and PMOS..."
            className="h-11 text-base font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug" className="text-xs">URL slug *</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">/blog/</span>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="carbs-and-pcos"
              className="font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="excerpt" className="text-xs">Excerpt (summary) *</Label>
          <Textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            placeholder="A 1-2 sentence summary that appears on the blog list page and in search results."
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content" className="text-xs">Content *</Label>
          <Textarea
            id="content"
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            placeholder={"Write the article content here. Use plain text with double line breaks between paragraphs.\n\nExample:\n\nThis is the first paragraph.\n\nThis is the second paragraph."}
            rows={20}
            className="font-mono text-sm resize-y"
          />
          <p className="text-[10px] text-muted-foreground">{form.content.length} characters</p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl border border-border/40 bg-card space-y-3">
          <h3 className="text-sm font-semibold">Publish settings</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => update("isPublished", !form.isPublished)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1",
                form.isPublished
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted/60 text-muted-foreground"
              )}
            >
              {form.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {form.isPublished ? "Published" : "Draft"}
            </button>
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
            <Label className="text-xs">Reading time (minutes)</Label>
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
              placeholder="pcos, carbs, insulin"
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
              <option value="from-primary to-secondary">Blue → Green (brand)</option>
              <option value="from-emerald-500 to-teal-500">Emerald → Teal</option>
              <option value="from-sky-500 to-blue-500">Sky → Blue</option>
              <option value="from-amber-500 to-orange-500">Amber → Orange</option>
              <option value="from-violet-500 to-purple-500">Violet → Purple</option>
              <option value="from-rose-500 to-pink-500">Rose → Pink</option>
            </select>
            <div className={cn("h-12 rounded-lg bg-gradient-to-br", form.coverAccent)} />
          </div>
        </div>
      </div>
    </div>
  );
}
