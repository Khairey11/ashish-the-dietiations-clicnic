import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Clock, ChevronRight, FileText } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { services as staticServices, getServiceDetail } from "@/lib/data";
import { getDbServiceBySlug } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  // Pre-render the static services at build time. DB-only services
  // will be rendered on-demand via dynamicParams (default true).
  return staticServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getDbServiceBySlug(slug);
  if (!service) return { title: "Service Not Found" };
  return {
    title: service.title,
    description: `${service.tagline}. ${service.problem} ${service.solution}`,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getDbServiceBySlug(slug);
  if (!service) notFound();
  const detail = getServiceDetail(slug);
  const related = detail.relatedSlugs
    .map((s) => staticServices.find((svc) => svc.slug === s))
    .filter(Boolean);

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 pt-8">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/services" className="hover:text-foreground">Services</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{service.title}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className={cn("relative py-12 lg:py-16 bg-gradient-to-br overflow-hidden", service.accent)}>
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-4xl">
            <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-premium", service.accent)}>
              <service.icon className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
              {service.title}
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl">{service.tagline}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge className="bg-primary/15 text-primary border-0">
                <Clock className="w-3 h-3 mr-1" />
                {service.duration}
              </Badge>
              <Badge variant="outline" className="capitalize border-border/60">
                {service.category.replace("-", " ")}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-border/60 bg-card p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-rose-500" />
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">The problem</h2>
              </div>
              <p className="text-lg leading-relaxed text-foreground/90">{service.problem}</p>
            </div>
            <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Our solution</h2>
              </div>
              <p className="text-lg leading-relaxed text-foreground/90">{service.solution}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Expected outcomes</h2>
            <p className="mt-2 text-muted-foreground">Based on data from our 12,400+ client cohort.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {detail.outcomes.map((o) => (
              <div key={o.metric} className="rounded-2xl bg-card border border-border/60 p-5 text-center">
                <p className="text-3xl font-bold text-primary">{o.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{o.metric}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Key benefits</h2>
            <p className="mt-2 text-muted-foreground">What you can expect from this program.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl">
            {service.benefits.map((b, i) => (
              <div key={b} className="flex items-start gap-3 p-5 rounded-2xl border border-border/60 bg-card">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm font-medium">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">How it works</h2>
            <p className="mt-2 text-muted-foreground">A clear, structured process from first call to lasting change.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
            {detail.process.map((step) => (
              <div key={step.step} className="rounded-2xl border border-border/60 bg-card p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 text-white font-bold">
                  {step.step}
                </div>
                <h3 className="font-semibold mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold">Frequently asked questions</h2>
              <p className="mt-2 text-muted-foreground">Everything you need to know about {service.title.toLowerCase()}.</p>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {detail.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-border/60 bg-card px-5">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-secondary p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-white shadow-glow">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Ready to start {service.title.toLowerCase()}?</h2>
              <p className="mt-2 text-white/85">Book a free 15-minute discovery call with one of our specialists.</p>
            </div>
            <Link href="/booking">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-6">
                Book consultation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Related services */}
      {related.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold mb-8">Related services</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => r && (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  className="group rounded-2xl border border-border/60 bg-card p-5 hover:shadow-premium hover:-translate-y-1 transition-all"
                >
                  <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3", r.accent)}>
                    <r.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{r.tagline}</p>
                  <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
