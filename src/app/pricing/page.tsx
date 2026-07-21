import Link from "next/link";
import { Check, Clock, ArrowRight, Star, Shield, Zap, Crown } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Pricing & Consultation Packages",
  description: "Transparent pricing for nutrition consultations and diet programs. Compare packages, inclusions, and consultation durations. Book your personalized nutrition consultation today.",
  alternates: { canonical: "/pricing" },
};

const packages = [
  {
    name: "Single Consultation",
    duration: "60 minutes",
    price: "Rs. 1,500",
    originalPrice: null,
    tagline: "Perfect for a second opinion or targeted advice",
    accent: "from-primary to-secondary",
    popular: false,
    icon: Zap,
    features: [
      "60-minute one-on-one consultation",
      "Basic dietary assessment",
      "General nutrition guidance",
      "Q&A session with dietitian",
      "Summary email with key recommendations",
      "Follow-up via email (up to 7 days)",
    ],
    notIncluded: [
      "Personalized meal plan",
      "Progress tracking",
      "Ongoing support",
    ],
  },
  {
    name: "30-Day Program",
    duration: "30 days",
    price: "Rs. 2,999",
    originalPrice: "Rs. 3,999",
    tagline: "Kickstart your nutrition journey",
    accent: "from-primary to-secondary",
    popular: true,
    icon: Star,
    features: [
      "1:1 consultation with clinical dietitian",
      "Personalized meal plan",
      "Body composition analysis (if available)",
      "WhatsApp support (Mon–Fri)",
      "1 follow-up session",
      "Recipe suggestions & food alternatives",
      "Progress tracking via dashboard",
    ],
    notIncluded: [
      "Lab report review",
      "CGM integration",
    ],
  },
  {
    name: "90-Day Transformation",
    duration: "90 days",
    price: "Rs. 7,999",
    originalPrice: "Rs. 10,999",
    tagline: "Lasting lifestyle transformation",
    accent: "from-secondary to-primary",
    popular: false,
    icon: Crown,
    features: [
      "Bi-weekly 1:1 consultations (6 total)",
      "Custom macro adjustments",
      "Comprehensive lab review",
      "Progress photo tracking",
      "Habit coaching sessions",
      "Grocery list generator",
      "Priority WhatsApp support (6 days/week)",
      "3 follow-up sessions",
      "Body composition tracking",
    ],
    notIncluded: [],
  },
  {
    name: "Annual Wellness",
    duration: "365 days",
    price: "Rs. 24,999",
    originalPrice: "Rs. 39,999",
    tagline: "A full year of guided wellness",
    accent: "from-primary to-secondary",
    popular: false,
    icon: Shield,
    features: [
      "Unlimited consultations",
      "Priority scheduling",
      "Annual health panel review",
      "Family access (up to 3 members)",
      "Concierge support (7 days/week)",
      "Quarterly body composition analysis",
      "Maintenance phase planning",
      "Mindful eating workshop",
      "Recipe customisation",
      "Unlimited messages",
    ],
    notIncluded: [],
  },
];

const comparisonFeatures = [
  { feature: "Consultation duration", values: ["60 min", "60 min", "60 min", "60 min"] },
  { feature: "Number of consultations", values: ["1", "2", "6", "Unlimited"] },
  { feature: "Personalized meal plan", values: [false, true, true, true] },
  { feature: "Follow-up sessions", values: [false, "1", "3", "Unlimited"] },
  { feature: "WhatsApp support", values: [false, "Mon–Fri", "6 days/week", "7 days/week"] },
  { feature: "Body composition tracking", values: [false, false, true, true] },
  { feature: "Lab report review", values: [false, false, true, true] },
  { feature: "Progress photo tracking", values: [false, false, true, true] },
  { feature: "Habit coaching", values: [false, false, true, true] },
  { feature: "Family access", values: [false, false, false, "Up to 3"] },
  { feature: "Priority scheduling", values: [false, false, false, true] },
  { feature: "Recipe customisation", values: [false, false, false, true] },
];

const pricingFAQs = [
  {
    q: "What does the consultation fee include?",
    a: "Every consultation includes a one-on-one session with a clinical dietitian, a personalized nutrition assessment, and actionable recommendations. Higher-tier packages include meal plans, follow-up sessions, progress tracking, and ongoing support via WhatsApp.",
  },
  {
    q: "Do you accept insurance?",
    a: "We partner with several major insurers for Medical Nutrition Therapy sessions. Coverage varies by provider and plan. Our team will verify your benefits before your first appointment and provide an itemized receipt for reimbursement.",
  },
  {
    q: "Can I pay in installments?",
    a: "Yes. Programs of 90 days or longer can be paid in up to 3 installments. Contact us to arrange a payment plan that works for you.",
  },
  {
    q: "What is your refund policy?",
    a: "Cancellations within the first 14 days are fully refundable minus the consultation fee. After 14 days, unused sessions remain valid for 12 months. No refunds are issued for partially completed programs.",
  },
  {
    q: "Are online consultations as effective as in-person?",
    a: "Yes. Studies show that telehealth nutrition counseling is equally effective for most conditions, including weight management, diabetes, and PCOS. In-clinic visits are recommended only for body composition analysis and hands-on assessments.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Khalti, eSewa, bank transfer, and cash. Payment is completed securely through our platform after your consultation request is approved.",
  },
];

const consultationSteps = [
  { step: 1, title: "Health Assessment Survey", description: "Complete a comprehensive survey covering your health goals, lifestyle, and medical history." },
  { step: 2, title: "Dietitian Review", description: "Your assigned dietitian reviews your assessment and any uploaded medical reports." },
  { step: 3, title: "Approval & Package Selection", description: "Your consultation is approved. Choose the package that fits your needs and complete payment." },
  { step: 4, title: "Consultation Scheduled", description: "Your appointment is confirmed. Attend via video or in-clinic at the scheduled time." },
  { step: 5, title: "Personalized Plan Created", description: "Receive your custom nutrition plan within 48 hours of your consultation." },
  { step: 6, title: "Follow-up & Monitoring", description: "Regular check-ins track your progress and adjust your plan as needed." },
];

export default function PricingPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Pricing & Packages"
        title={<>Transparent pricing for <span className="gradient-text">every goal</span></>}
        description="Choose the consultation package that fits your health journey. No hidden fees, no surprises — just evidence-based nutrition care."
        accent="from-primary/15 to-secondary/10"
      />

      {/* Packages */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={cn(
                  "relative rounded-2xl bg-card border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-premium flex flex-col",
                  pkg.popular ? "border-primary shadow-glow ring-2 ring-primary/30" : "border-border/60"
                )}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground gap-1 shadow-glow">
                      <Star className="w-3 h-3 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4", pkg.accent)}>
                    <pkg.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">{pkg.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">{pkg.tagline}</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold">{pkg.price}</span>
                    {pkg.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">{pkg.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {pkg.duration}
                  </p>

                  <ul className="space-y-2 mb-4 flex-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-primary" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                    {pkg.notIncluded.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground/50">
                        <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[8px]">—</span>
                        </div>
                        <span className="line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/booking">
                    <Button className={cn("w-full", pkg.popular ? "bg-gradient-to-r from-primary to-secondary" : "")} variant={pkg.popular ? "default" : "outline"}>
                      Choose {pkg.name.split(" ")[0]}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Compare Packages</h2>
            <p className="mt-2 text-muted-foreground">Find the right level of support for your goals.</p>
          </div>
          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Feature</th>
                  {packages.map((p) => (
                    <th key={p.name} className="text-center py-3 px-4 font-semibold min-w-[120px]">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={row.feature} className={cn("border-b border-border/20", i % 2 === 1 && "bg-muted/20")}>
                    <td className="py-3 px-4 font-medium">{row.feature}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="text-center py-3 px-4">
                        {typeof v === "boolean" ? (
                          v ? (
                            <Check className="w-4 h-4 text-primary inline" />
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )
                        ) : (
                          <span className="text-xs">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Consultation Process */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">How Our Consultation Process Works</h2>
            <p className="mt-2 text-muted-foreground">From your first assessment to lasting results — here's what to expect.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {consultationSteps.map((s) => (
              <div key={s.step} className="p-5 rounded-2xl border border-border/60 bg-card">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 text-white font-bold">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing FAQs */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Pricing FAQs</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {pricingFAQs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-border/60 bg-card px-5">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white text-center">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-white/85 mb-8 max-w-xl mx-auto">
            Complete our health assessment survey and take the first step toward better health.
          </p>
          <Link href="/booking">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-8 text-base font-semibold">
              Start Your Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
