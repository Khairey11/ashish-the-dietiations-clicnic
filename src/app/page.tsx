import { Navigation } from "@/components/site/navigation";
import { Hero } from "@/components/sections/hero";
import { TrustBar } from "@/components/sections/trust-bar";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Programs } from "@/components/sections/programs";
import { Testimonials } from "@/components/sections/testimonials";
import { Booking } from "@/components/sections/booking";
import { About } from "@/components/sections/about";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { CTABanner } from "@/components/sections/cta-banner";
import { Footer } from "@/components/sections/footer";
import { FloatingWhatsApp } from "@/components/site/floating-whatsapp";
import { getDynamicConfig, type DynamicConfig } from "@/lib/site-config";
import {
  getDbPrograms,
  getDbTestimonials,
  getDbFaqs,
  getDbDietitians,
} from "@/lib/queries";

export default async function Home() {
  const [config, dbPrograms, dbTestimonials, dbFaqs, dbDietitians] = await Promise.all([
    getDynamicConfig(),
    getDbPrograms(),
    getDbTestimonials(),
    getDbFaqs(),
    getDbDietitians(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1">
        <Hero />
        <TrustBar />
        <Services />
        <Process />
        <Programs programs={dbPrograms} />
        <Testimonials testimonials={dbTestimonials} />
        <About />
        <CTABanner />
        <Booking config={config} dietitians={dbDietitians} programs={dbPrograms} />
        <FAQ faqs={dbFaqs} />
        <Contact config={config} />
      </main>
      <Footer config={config} />
      <FloatingWhatsApp config={config} />
    </div>
  );
}
