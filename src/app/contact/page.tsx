import { SiteLayout } from "@/components/site/site-layout";
import { Contact } from "@/components/sections/contact";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Ashish Nutrition Clinic. Call, WhatsApp, email, or send us a message — we reply within 1 hour during clinic hours.",
};

export default function ContactPage() {
  return (
    <SiteLayout>
      <section className="pt-16 pb-8 bg-gradient-to-br from-primary/10 to-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
              Get in touch
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
              We&apos;re here when you <span className="gradient-text">need us</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
              Whether you have a quick question or are ready to start your journey, our team is ready to help — typically replying within 1 hour during clinic hours.
            </p>
          </div>
        </div>
      </section>
      <Contact />
    </SiteLayout>
  );
}
