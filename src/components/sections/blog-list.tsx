"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Calendar, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type BlogPostItem = {
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readingTime: number;
  accent: string;
  tags: string[];
};

export function BlogList({ posts }: { posts: BlogPostItem[] }) {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts]
  );

  const filtered = React.useMemo(() => {
    return posts.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [posts, search, category]);

  const [featured, ...rest] = filtered;

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Search & filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles, topics, tags..."
              className="pl-9 h-11"
              aria-label="Search articles"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No articles found. Try a different search.</p>
          </div>
        )}

        {featured && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Link
              href={`/blog/${featured.id}`}
              className="group relative rounded-3xl overflow-hidden border border-border/60 bg-card hover:shadow-premium transition-all duration-300"
            >
              <div className={cn("relative h-64 bg-gradient-to-br", featured.accent)}>
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-background/30 backdrop-blur text-foreground border-0">Featured</Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-background/40 backdrop-blur text-foreground border-0">{featured.category}</Badge>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{featured.author}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(featured.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{featured.readingTime} min read</span>
                </div>
              </div>
            </Link>

            <div className="space-y-4">
              {rest.slice(0, 3).map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    href={`/blog/${post.id}`}
                    className="group flex gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className={cn("relative w-28 sm:w-36 h-28 sm:h-32 rounded-xl bg-gradient-to-br flex-shrink-0 overflow-hidden", post.accent)}>
                      <div className="absolute inset-0 bg-grid opacity-30" />
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-background/40 backdrop-blur text-[10px] font-semibold">{post.category}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="text-base font-semibold leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author.split(" ").slice(-1)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime} min</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All articles grid */}
        {filtered.length > 1 && (
          <>
            <h2 className="text-xl font-bold mb-6">All articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-premium hover:-translate-y-1 transition-all"
                >
                  <div className={cn("relative h-40 bg-gradient-to-br", post.accent)}>
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-background/40 backdrop-blur text-foreground border-0 text-[10px]">{post.category}</Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author.split(" ").slice(-1)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
