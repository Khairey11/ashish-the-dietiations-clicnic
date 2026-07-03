"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar, User } from "lucide-react";
import { blogPosts } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { cn } from "@/lib/utils";

export function Blog() {
  const [featured, ...rest] = blogPosts;
  return (
    <SectionWrapper id="blog" className="bg-background">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
        <SectionHeader
          align="left"
          eyebrow="From the clinic"
          title={
            <>
              Insights from our{" "}
              <span className="gradient-text">clinical team</span>
            </>
          }
          description="Evidence-based articles on nutrition, metabolism, behaviour change and the latest research — written by our dietitians."
        />
        <Link href="/blog" className="shrink-0">
          <Button variant="outline">
            View all articles
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Featured */}
        <Link href={`/blog/${featured.id}`} className="block">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative rounded-3xl overflow-hidden border border-border/60 bg-card hover:shadow-premium transition-all duration-300 h-full"
          >
            <div className={cn("relative h-64 bg-gradient-to-br", featured.accent)}>
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="absolute top-4 left-4">
                <Badge className="bg-background/30 backdrop-blur text-foreground border-0">
                  Featured
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-background/40 backdrop-blur text-foreground border-0">
                  {featured.category}
                </Badge>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                {featured.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {featured.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(featured.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {featured.readingTime} min read
                </span>
              </div>
            </div>
          </motion.article>
        </Link>

        {/* List */}
        <div className="space-y-4">
          {rest.map((post, i) => (
            <Link href={`/blog/${post.id}`} key={post.id} className="block">
              <motion.article
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group flex gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 h-full"
              >
                <div className={cn("relative w-28 sm:w-36 h-28 sm:h-32 rounded-xl bg-gradient-to-br flex-shrink-0 overflow-hidden", post.accent)}>
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-0.5 rounded-md bg-background/40 backdrop-blur text-[10px] font-semibold">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="text-base font-semibold leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author.split(" ").slice(-1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime} min
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
