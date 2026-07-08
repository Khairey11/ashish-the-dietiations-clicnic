import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, ChevronRight, Tag } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { ShareButton } from "@/components/site/share-button";
import { blogArticles, getBlogArticle, blogPosts } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) notFound();

  const related = blogPosts.filter((p) => p.id !== article.id && p.category === article.category).slice(0, 2);
  const fallbackRelated = blogPosts.filter((p) => p.id !== article.id).slice(0, 2);
  const finalRelated = related.length > 0 ? related : fallbackRelated;

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 pt-8">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium line-clamp-1">{article.title}</span>
        </nav>
      </div>

      {/* Header */}
      <article className="py-10 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <Badge className="bg-primary/15 text-primary border-0 mb-4">{article.category}</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-[1.1]">
              {article.title}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>

            {/* Author + meta */}
            <div className="mt-8 flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold", article.authorAccent)}>
                  {article.authorInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{article.author}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(article.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readingTime} min read</span>
                  </div>
                </div>
              </div>
              <ShareButton title={article.title} url={`/blog/${slug}`} />
            </div>

            {/* Cover */}
            <div className={cn("relative h-64 sm:h-80 rounded-3xl bg-gradient-to-br my-8 overflow-hidden", article.accent)}>
              <div className="absolute inset-0 bg-grid opacity-30" />
            </div>

            {/* Body */}
            <div className="prose prose-lg max-w-none">
              {article.content.map((section, i) => (
                <div key={i} className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight mb-3 mt-8 first:mt-0">{section.heading}</h2>
                  <p className="text-base text-foreground/85 leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap mt-8 pt-8 border-t border-border/40">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {article.tags.map((t) => (
                <Badge key={t} variant="outline" className="font-normal">{t}</Badge>
              ))}
            </div>

            {/* Author bio */}
            <div className="mt-8 p-6 rounded-2xl bg-muted/40 border border-border/40 flex items-start gap-4">
              <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold flex-shrink-0", article.authorAccent)}>
                {article.authorInitials}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">About the author</p>
                <p className="font-semibold mb-1">{article.author}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{article.authorBio}</p>
              </div>
            </div>

            {/* Back to blog */}
            <div className="mt-8">
              <Link href="/blog">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to all articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {finalRelated.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold mb-8">Continue reading</h2>
            <div className="grid sm:grid-cols-2 gap-5 max-w-4xl">
              {finalRelated.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group flex gap-4 p-5 rounded-2xl border border-border/60 bg-card hover:shadow-premium hover:-translate-y-0.5 transition-all"
                >
                  <div className={cn("relative w-24 h-24 rounded-xl bg-gradient-to-br flex-shrink-0 overflow-hidden", post.accent)}>
                    <div className="absolute inset-0 bg-grid opacity-30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px] mb-1.5">{post.category}</Badge>
                    <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{post.readingTime} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
